import { Request, Response } from "express";
import { surgeryAuthService } from "../../../config/initializeServices.js";

export const approveRequest = async (req: Request, res: Response) => {
	const requestId = parseInt(req.params.id);

	if (isNaN(requestId)) throw Error("Invalid request ID format");

	await surgeryAuthService.handleRequestApproval(requestId);

	res.json({
		success: true,
		message: "Request approved successfully",
	});
};
