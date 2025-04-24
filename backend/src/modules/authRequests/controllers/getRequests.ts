import { Request, Response } from "express";
import {
	authenticationRequestRepo,
	surgeryRepo,
} from "../../../config/repositories.js";

export const getRequests = async (req: Request, res: Response) => {
	const surgeryId = parseInt(req.params.surgeryId);

	if (isNaN(surgeryId)) throw Error("Invalid Surgery ID");

	const surgery = await surgeryRepo.findOne({
		where: { id: surgeryId },
		relations: ["procedure"],
	});

	if (!surgery) throw Error("Surgery Not Found");

	const requests = await authenticationRequestRepo.find({
		where: {
			surgery,
		},
		relations: ["trainee", "consultant"],
	});

	if (requests.length === 0) throw Error("No requests Found");

	res.status(200).json({
		success: true,
		requests,
		surgery,
	});
};
