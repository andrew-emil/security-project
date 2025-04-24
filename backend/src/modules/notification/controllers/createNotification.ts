import { Request, Response } from "express";
import { createNotificationSchema } from "../../../utils/zodSchemas.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import { NOTIFICATION_TYPES } from "../../../utils/dataTypes.js";
import { NotificationService } from "../../../service/NotificationService.js";

export const createNotification = async (req: Request, res: Response) => {
	const validation = createNotificationSchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { userId, type, message } = validation.data;

	const notificationService = new NotificationService();

	await notificationService.createNotification(
		userId,
		type as NOTIFICATION_TYPES,
		message
	);

	res.status(201).json({
		success: true,
		message: "Notification sent successfully",
	});
};
