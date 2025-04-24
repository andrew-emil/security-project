import { Request, Response } from "express";
import {
	affiliationRepo,
	departmentRepo,
} from "../../../config/repositories.js";
import { updateDepartmentSchema } from "../../../utils/zodSchemas.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";

export const updateDepartment = async (req: Request, res: Response) => {
	const validation = updateDepartmentSchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { id, name } = validation.data;

	if (!id || isNaN(parseInt(id))) throw Error("Invalid department ID");

	const departmentId = parseInt(id);

	const department = await departmentRepo.findOne({
		where: { id: departmentId },
		relations: ["affiliation"],
	});

	if (!department) throw Error("Department not found");

	if (name) department.name = name;

	await departmentRepo.save(department);

	res.status(200).json({
		success: true,
		message: "Department updated successfully",
	});
};
