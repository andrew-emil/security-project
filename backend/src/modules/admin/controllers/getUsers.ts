import { Request, Response } from "express";
import { userRepo } from "../../../config/repositories.js";
import { Not } from "typeorm";
import { USER_STATUS } from "../../../utils/dataTypes.js";

export const getUsers = async (req: Request, res: Response) => {
	const { page = "1" } = req.query;

	const limit = 15;
	const parsedPage = parseInt(page.toString());
	const skip = (parsedPage - 1) * limit;
	const currentUserId = req.user.id;

	const total = await userRepo.count({
		where: {
			id: Not(currentUserId),
			account_status: USER_STATUS.ACTIVE,
		},
	});

	const users = await userRepo.find({
		where: {
			id: Not(currentUserId),
			account_status: USER_STATUS.ACTIVE,
		},
		skip,
		take: limit,
		select: {
			id: true,
			first_name: true,
			last_name: true,
			email: true,
			picture: true,
			role: {
				id: true,
				name: true,
			},
			affiliation: {
				id: true,
				name: true,
			},
			department: {
				id: true,
				name: true,
			},
		},
		relations: {
			role: true,
			affiliation: true,
			department: true,
		},
		order: { first_name: "ASC", last_name: "ASC" },
	});

	res.status(200).json({
		users,
		pagination: {
			total,
			pages: Math.ceil(total / limit),
			currentPage: parsedPage,
		},
	});
};
