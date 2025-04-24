import { Response, Request } from "express";
import {
	permissionRepo,
	roleRepo,
	procedureTypeRepo,
	requirementRepo,
} from "../../../config/repositories.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import { addRoleSchema } from "../../../utils/zodSchemas.js";

export const addRole = async (req: Request, res: Response) => {
	const validation = addRoleSchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { name, parentId, permissionActions, procedureRequirements } =
		validation.data;

	const existingRole = await roleRepo
		.createQueryBuilder("role")
		.where("LOWER(role.name) = LOWER(:name)", { name })
		.getOne();

	if (existingRole) {
		res.status(409).json({
			success: false,
			message: "Role already exists",
		});
		return;
	}

	const parentRole = await roleRepo.findOne({
		where: { id: parentId },
		relations: ["children"],
	});

	if (!parentRole) {
		res.status(400).json({
			success: false,
			message: "Invalid parent role",
		});
		return;
	}

	const permissions = await Promise.all(
		permissionActions.map(async (actionId) => {
			const permission = await permissionRepo.findOneBy({ id: actionId });
			if (!permission) {
				throw new Error(`Permission with ID ${actionId} not found`);
			}
			return permission;
		})
	);

	const newRole = roleRepo.create({
		name,
		parent: parentRole,
		permissions,
	});

	const queryRunner = roleRepo.manager.connection.createQueryRunner();
	await queryRunner.connect();
	await queryRunner.startTransaction();

	try {
		await queryRunner.manager.save(newRole);

		for (const req of procedureRequirements) {
			const procedureType = await procedureTypeRepo.findOne({
				where: { id: req.procedureTypeId },
			});

			if (!procedureType) {
				throw new Error(`Procedure type ${req.procedureTypeId} not found`);
			}

			if (procedureType.category !== req.category) {
				throw new Error(
					`Procedure type ${procedureType.name} belongs to category ${procedureType.category}, not ${req.category}`
				);
			}

			const requirement = requirementRepo.create({
				role: newRole,
				procedure: procedureType,
				requiredCount: req.requiredCount,
			});

			await queryRunner.manager.save(requirement);
		}

		await queryRunner.commitTransaction();

		res.status(201).json({
			success: true,
			message: "Role added with requirements successfully",
		});
	} catch (error) {
		await queryRunner.rollbackTransaction();
		res.status(500).json({
			success: false,
			message: error instanceof Error ? error.message : "Failed to create role",
		});
	} finally {
		await queryRunner.release();
	}
};
