import { Request, Response } from "express";
import { roleRepo } from "../../../config/repositories.js";

export const getRoleById = async (req: Request, res: Response) => {
	const parsedId = parseInt(req.params.roleId);

	if (isNaN(parsedId)) throw Error("Invalid Role Id format");

	const role = await roleRepo.findOne({
		where: {
			id: parsedId,
		},
		relations: [
			"permissions",
			"requirements",
			"parent",
			"requirements.procedure",
		],
		select: {
			id: true,
			name: true,
			permissions: {
				id: true,
				action: true,
			},
			parent: {
				id: true,
				name: true,
			},
			requirements: {
				id: true,
				procedure: {
					id: true,
					category: true,
				},
				requiredCount: true,
			},
		},
	});

	if (!role) throw Error("Role not found");

	res.status(200).json(role);
};
