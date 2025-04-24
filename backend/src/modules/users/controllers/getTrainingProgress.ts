import { Request, Response } from "express";
import { trainingService } from "../../../config/initializeServices.js";

export const getTrainingProgress = async (req: Request, res: Response) => {
	// #swagger.tags = ['Users']
	const userId = req.user?.id;
	if (!userId) throw Error("unauthorized");

	const progress = await trainingService.getTrainingProgress(userId);

	res.status(200).json({
		success: true,
		progress,
	});
};
