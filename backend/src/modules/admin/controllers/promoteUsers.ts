import { Request, Response } from "express";
import { NOTIFICATION_TYPES, USER_STATUS } from "../../../utils/dataTypes.js";
import { AppDataSource } from "../../../config/data-source.js";
import { User } from "../../../entity/sql/User.js";
import { Role } from "../../../entity/sql/Roles.js";
import { notificationService } from "../../../config/initializeServices.js";

export const promoteUser = async (req: Request, res: Response) => {
	const userId = req.params.userId as string;

	if (!userId) throw Error("Invalid user id");

	await AppDataSource.transaction(async (manager) => {
		const user = await manager.findOne(User, {
			where: {
				account_status: USER_STATUS.ACTIVE,
				id: userId,
			},
			relations: ["role", "role.parent"],
		});
		if (!user) throw Error("User not found");
		if (!user.role || !user.role.parent) {
			res.status(400).json({
				message: "can't promote, User in the highest hierarchy",
			});
			return;
		}

		const parentRole = await manager.findOne(Role, {
			where: {
				id: user.role.parent.id,
			},
			relations: {
				parent: true,
			},
		});

		if (!parentRole) {
			throw new Error("Parent role not found");
		}
		if (parentRole.name === "Admin") {
			res.status(400).json({
				message: "can't promote, User in the highest hierarchy",
			});
			return;
		}

		await manager.update(
			User,
			{
				id: user.id,
			},
			{
				role: parentRole,
			}
		);
		await notificationService.createNotification(
			userId,
			NOTIFICATION_TYPES.ROLE_UPDATE,
			`Your role has been Promoted to ${parentRole}`
		);
	});

	res.status(200).json({
		message: "User promoted successfully",
	});
};
