import { Request, Response } from "express";
import { userRepo } from "../../../config/repositories.js";
import { formatService } from "../../../config/initializeServices.js";

export const getUserData = async (req: Request, res: Response) => {
	if (!req.user) throw Error("Unauthorized");
	const userId = req.user?.id;

	const user = await userRepo.findOne({
		where: { id: userId },
		relations: {
			department: true,
			affiliation: true,
			role: {
				permissions: true,
			},
		},
		select: {
			id: true,
			first_name: true,
			last_name: true,
			email: true,
			phone_number: true,
			picture: true,
			department: {
				id: true,
				name: true,
			},
			affiliation: {
				id: true,
				name: true,
			},
			role: {
				id: true,
				name: true,
				permissions: true,
			},
		},
	});

	if (!user) throw Error("user not found");

	const formattedUser = formatService.formatUserData(user);

	res.status(200).json({
		success: true,
		user: formattedUser,
	});
};
