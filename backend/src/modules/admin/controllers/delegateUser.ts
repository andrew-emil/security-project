import { Request, Response } from "express";
import { z } from "zod";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import { AppDataSource } from "../../../config/data-source.js";
import { User } from "../../../entity/sql/User.js";
import { Role } from "../../../entity/sql/Roles.js";
import { notificationService } from "../../../config/initializeServices.js";
import { NOTIFICATION_TYPES } from "../../../utils/dataTypes.js";

const delegateUserSchema = z.object({
	userId: z.string(),
	roleId: z.coerce
		.number()
		.int()
		.positive("Role ID must be a positive integer"),
});

export const delegateUser = async (req: Request, res: Response) => {
	const validation = delegateUserSchema.safeParse(req.params);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { userId, roleId } = validation.data;

	await AppDataSource.transaction(async (sqlManager) => {
		const user = await sqlManager.findOne(User, {
			where: {
				id: userId,
			},
			relations: ["role", "role.children"],
		});

		if (!user) throw Error("User not found");

		if (!user.role) {
			res.status(400).json({
				message: "User has no assigned role",
			});
			return;
		}

		const targetRole = await sqlManager.findOne(Role, {
			where: {
				id: roleId,
			},
			relations: ["children", "parent"],
		});

		if (!targetRole || !targetRole.children) {
			res.status(400).json({
				message: "can't delegate, User in the lowest hierarchy",
			});
			return;
		}

		const isDirectChild = user.role.children.some(
			(child) => child.id === targetRole.id
		);

		if (!isDirectChild) {
			res.status(400).json({
				message: "Target role is not a direct child of current user role",
			});
			return;
		}

		await sqlManager.update(User, { id: user.id }, { role: targetRole });
		await notificationService.createNotification(
			userId,
			NOTIFICATION_TYPES.ROLE_UPDATE,
			`Your role has been delegated to ${targetRole}`
		);
	});


	res.status(200).json({
		message: "User delegated successfully",
	});
};
