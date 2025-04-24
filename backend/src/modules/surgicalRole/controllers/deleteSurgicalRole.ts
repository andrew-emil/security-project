import { Request, Response } from "express";
import { surgicalRolesRepo } from "../../../config/repositories.js";

export const deleteSurgicalRole = async (req: Request, res: Response) => {
	const { id } = req.params;

	const parsedId = parseInt(id);
	if (isNaN(parsedId)) {
		throw Error("Invalid ID format");
	}

	const surgicalRole = await surgicalRolesRepo.findOneBy({ id: parsedId });

	if (!surgicalRole) {
		throw Error("Surgical role not found");
	}

	await surgicalRolesRepo.delete({ id: parsedId });

	res.status(201).json({
		message: "surgical role deleted successfully",
	});
};
