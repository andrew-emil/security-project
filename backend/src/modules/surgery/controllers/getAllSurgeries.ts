import { Request, Response } from "express";
import { surgeryLogsRepo } from "../../../config/repositories.js";
import { formatService } from "../../../config/initializeServices.js";

export const getAllSurgeries = async (req: Request, res: Response) => {
	const surgeries = await surgeryLogsRepo.find({
		select: [
			"id",
			"surgeryId",
			"doctorsTeam",
			"leadSurgeon",
			"icdCode",
			"slots",
			"cptCode",
			"date",
			"time",
		],
	});

	if (surgeries.length === 0) {
		res.status(400).json({
			message: "No Surgeries was found",
		});
		return;
	}

	const formatedSurgeries = await formatService.formatSurgeries(surgeries);

	res.status(200).json({
		surgeries: formatedSurgeries,
	});
};
