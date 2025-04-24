import { Request, Response } from "express";
import { surgicalRolesRepo } from "../../../config/repositories.js";
import { sanitizeString } from "../../../utils/sanitizeString.js";

export const updateSurgicalRole = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { name } = req.body;

	if (!name || typeof name !== "string" || name.trim() === "") {
		throw Error("Invalid or missing 'name' field");
	}

	const parsedId = parseInt(id);
	if (isNaN(parsedId)) {
		throw Error("Invalid ID format");
	}

	const sanitizedName = sanitizeString(name);
	const surgicalRole = await surgicalRolesRepo.findOneBy({ id: parsedId });

	if (!surgicalRole) {
		throw Error("Surgical role not found");
	}

	surgicalRole.name = sanitizedName;
	surgicalRole.updatedAt = new Date();

	await surgicalRolesRepo.save(surgicalRole);

	res.status(200).json({
		message: "surgical role updated successfully",
	});
};
