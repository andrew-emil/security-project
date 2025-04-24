import { Request, Response } from "express";
import { surgicalRolesRepo } from "../../../config/repositories.js";

export const getSurgicalRoles = async (req: Request, res: Response) => {
	const surgicalRole = await surgicalRolesRepo.find();

	if (surgicalRole.length === 0) {
		res.status(404).json({ message: "No sugical role were found" });
		return;
	}

	res.status(200).json(surgicalRole);
};
