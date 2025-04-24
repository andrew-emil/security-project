import { Request, Response } from "express";
import { z } from "zod";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import { AppDataSource } from "../../../config/data-source.js";
import { Role } from "../../../entity/sql/Roles.js";
import { Permission } from "../../../entity/sql/Permission.js";

const permissionSchema = z.object({
	permissions: z
		.array(z.number().positive())
		.min(1, "At least one permission is required"),
});

export const assignPermissions = async (req: Request, res: Response) => {
	const roleId = req.params.roleId;
	if (!roleId) throw new Error("Invalid role ID format");

	const validation = permissionSchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const permissionsIds = validation.data.permissions;
	const uniquePermissions = [...new Set(permissionsIds)]; // Remove duplicates

	await AppDataSource.transaction(async (entityManager) => {
		const role = await entityManager.findOne(Role, {
			where: {
				id: parseInt(roleId),
			},
			relations: {
				permissions: true,
			},
		});
		if (!role) throw Error("role not found");

		const permissions = await entityManager
			.createQueryBuilder(Permission, "permission")
			.where("permission.id IN (:...ids)", { ids: uniquePermissions })
			.getMany();

		if (permissions.length !== uniquePermissions.length) {
			const foundIds = permissions.map((p) => p.id);
			const missingIds = uniquePermissions.filter(
				(id) => !foundIds.includes(id)
			);
			throw new Error(`Permissions not found: ${missingIds.join(", ")}`);
		}

		await entityManager
			.createQueryBuilder()
			.relation(Role, "permissions")
			.of(role)
			.addAndRemove(permissions, role.permissions);
	});

	res.status(200).json({
		success: true,
		message: "Role updated successfully",
	});
};
