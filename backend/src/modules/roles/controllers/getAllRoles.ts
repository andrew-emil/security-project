import { Request, Response } from "express";
import { roleRepo } from "../../../config/repositories.js";
import { Not } from "typeorm";

export const getAllRoles = async (req: Request, res: Response) => {
	const [roles, total] = await Promise.all([
		roleRepo.find({
			where: { name: Not("Admin") },
			relations: {
				parent: true,
				permissions: true,
				requirements: {
					procedure: true,
				},
			},
			select: {
				id: true,
				name: true,
				permissions: true,
				parent: {
					id: true,
					name: true,
				},
				requirements: {
					id: true,
					requiredCount: true,
					procedure: {
						id: true,
						name: true,
						category: true,
					},
				},
			},
			order: {
				id: "ASC",
			},
		}),
		roleRepo.count({ where: { name: Not("Admin") } }),
	]);

	if (roles.length === 0) {
		res.status(404).json({ message: "No roles found" });
		return;
	}

	res.status(200).json({
		success: true,
		count: roles.length,
		total,
		data: roles.map((role) => ({
			id: role.id,
			name: role.name,
			parent: role.parent,
			permissions: role.permissions,
			requirements: role.requirements?.map((req) => ({
				id: req.id,
				requiredCount: req.requiredCount,
				procedure: {
					id: req.procedure.id,
					name: req.procedure.name,
					category: req.procedure.category,
				},
			})),
		})),
	});
};
