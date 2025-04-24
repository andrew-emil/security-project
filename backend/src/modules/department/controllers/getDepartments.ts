import { Request, Response } from "express";
import { departmentRepo } from "../../../config/repositories.js";

export const getDepartments = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!id || isNaN(parseInt(id))) throw Error("Invalid affiliation ID");

	const departments = await departmentRepo.find({
		where: { affiliation: { id: parseInt(id) } },
		relations: ["affiliation"],
	});

	if (departments.length === 0)
		throw Error("No departments found for this affiliation");

	res.status(200).json({ success: true, departments });
};
