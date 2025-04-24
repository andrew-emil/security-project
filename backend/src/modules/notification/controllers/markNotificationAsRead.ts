import { Request, Response } from "express";
import { notificationService } from "../../../config/initializeServices.js";

export const markNotificationAsRead = async (req: Request, res: Response) => {
	const { userId, notificationId } = req.body;

	if (isNaN(parseInt(notificationId)) || !userId)
		throw Error("Invalid credentails");

	if (req.user.id !== userId) throw Error("Unauthorized");

	await notificationService.markAsRead(parseInt(notificationId), userId);

	res.status(200).json({
		success: true,
		message: "Notification marked as read",
	});
};
