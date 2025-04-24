import { Request, Response } from "express";
import { notificationService } from "../../../config/initializeServices.js";

export const getNotification = async (req: Request, res: Response) => {
	const userId = req.params.userId;
	if (!userId) throw Error("Invalid User ID");

	if (req.user.id !== userId) throw Error("Unauthorized");

	const { notifications, unreadCount } =
		await notificationService.getUserNotifications(req.user.id);

	res.status(200).json({
		success: true,
		notifications,
		unreadCount,
	});
};
