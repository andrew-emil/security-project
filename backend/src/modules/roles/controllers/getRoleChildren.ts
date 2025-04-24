import { Request, Response } from "express";
import { roleRepo } from "../../../config/repositories.js";

export const getRoleChildren = async (req: Request, res: Response) => {
	const parsedRoleId = parseInt(req.params.roleId);

	if (isNaN(parsedRoleId) || parsedRoleId <= 0) throw Error("Invalid Role Id");

	const role = await roleRepo.findOne({
		where: {
			id: parsedRoleId,
		},
		relations: ["children"],
	});

	if (!role) throw Error("Role Not found");

	res.status(200).json({
		id: role.id,
		name: role.name,
		children: role.children || [],
	});
};
