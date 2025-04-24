import { Request, Response } from "express";
import { surgicalRolesRepo } from "../../../config/repositories.js";
import { sanitizeString } from "../../../utils/sanitizeString.js";

export const addSurgicalRole = async (req: Request, res: Response) => {
	const { name } = req.body;

	if (!name || typeof name !== "string" || name.trim() === "") {
		res.status(400).json({ message: "Invalid or missing 'name' field" });
		return;
	}

    const sanitizedName = sanitizeString(name)

	let surgicalRole = await surgicalRolesRepo.findOneBy({ name: sanitizedName });
	if (surgicalRole) {
		throw Error("Surgical Role already exist");
	}

	surgicalRole = surgicalRolesRepo.create({
		name: sanitizedName,
		createdAt: new Date(),
	});

	await surgicalRolesRepo.save(surgicalRole);

	res.status(201).json({
		message: "surgical role created successfully",
	});
};
