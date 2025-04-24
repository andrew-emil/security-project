import { Request, Response } from "express";
import { updateRoleSchema } from "../../../utils/zodSchemas.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import { requirementRepo, roleRepo } from "../../../config/repositories.js";
import { AppDataSource } from "../../../config/data-source.js";
import { Role } from "../../../entity/sql/Roles.js";
import { Permission } from "../../../entity/sql/Permission.js";
import { Requirement } from "../../../entity/sql/Requirments.js";
import { ProcedureType } from "../../../entity/sql/ProcedureType.js";

export const updateRole = async (req: Request, res: Response) => {
	const validation = updateRoleSchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { id, name, parentId, permissions, procedureRequirements } =
		validation.data;

	try {
		const role = await roleRepo.findOne({
			where: { id },
			relations: [
				"parent",
				"permissions",
				"requirements",
				"requirements.procedure",
			],
		});

		if (!role) {
			res.status(404).json({ success: false, message: "Role not found" });
			return;
		}

		await AppDataSource.transaction(async (transactionalEntityManager) => {
			if (name && name.toLowerCase() !== role.name.toLowerCase()) {
				const existingRole = await transactionalEntityManager
					.createQueryBuilder(Role, "role")
					.where("LOWER(role.name) = LOWER(:name)", { name })
					.getOne();

				if (existingRole) {
					throw new Error("Role name already exists");
				}
				role.name = name;
			}

			if (parentId !== undefined) {
				if (parentId === role.id) {
					throw new Error("A role cannot be its own parent");
				}
				const parentRole = await transactionalEntityManager.findOne(Role, {
					where: { id: parentId },
				});
				role.parent = parentRole || null;
			}

			if (permissions !== undefined) {
				const validPermissions = await transactionalEntityManager
					.createQueryBuilder(Permission, "permission")
					.where("permission.id IN (:...ids)", { ids: permissions })
					.getMany();

				role.permissions = validPermissions;
			}

			if (procedureRequirements.length > 0) {
				const existingRequirementIds = role.requirements.map((r) => r.id);

				const payloadRequirementIds = procedureRequirements
					.filter((req) => req.id)
					.map((req) => req.id);

				const idsToRemove = existingRequirementIds.filter(
					(id) => !payloadRequirementIds.includes(id)
				);

				if (idsToRemove.length > 0) {
					await transactionalEntityManager.delete(Requirement, idsToRemove);
				}

				for (const req of procedureRequirements) {
					const procedure = await transactionalEntityManager.findOne(
						ProcedureType,
						{
							where: { id: req.procedureTypeId },
							relations: {
								requirements: true,
							},
						}
					);

					if (!procedure) {
						throw new Error(`Procedure type ${req.procedureTypeId} not found`);
					}

					if (procedure.category !== req.category) {
						throw new Error(
							`Category mismatch for ${procedure.name}: Expected ${procedure.category}, got ${req.category}`
						);
					}

					if (req.id) {
						await transactionalEntityManager.update(
							Requirement,
							{ id: req.id },
							{
								requiredCount: req.requiredCount,
								procedure: { id: procedure.id },
							}
						);
					} else {
						const newReq = requirementRepo.create({
							procedure,
							requiredCount: req.requiredCount,
							role,
						});
						await requirementRepo.save(newReq);
					}
				}
			}

			await transactionalEntityManager.save(role);
		});

		res.status(200).json({
			success: true,
			message: "Role updated successfully",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: error instanceof Error ? error.message : "Failed to update role",
		});
	}
};
