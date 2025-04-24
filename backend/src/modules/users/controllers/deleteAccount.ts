import { Request, Response } from "express";
import {
	notificationRepo,
	ratingRepo,
	surgeryLogsRepo,
} from "../../../config/repositories.js";
import { AppDataSource } from "../../../config/data-source.js";
import { User } from "../../../entity/sql/User.js";
import { USER_STATUS } from "../../../utils/dataTypes.js";
import { AuthenticationRequest } from "../../../entity/sql/AuthenticationRequests.js";
import { UserProgress } from "../../../entity/sql/UserProgress.js";

export const deleteAccount = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!id) throw Error("Invalid user ID");
	if (req.user.id !== id) throw Error("Unauthorized");

	await AppDataSource.transaction(async (sqlManager) => {
		const user = await sqlManager.findOne(User, {
			where: {
				account_status: USER_STATUS.ACTIVE,
				id,
			},
		});

		if (!user) throw Error("User not found");

		const [authRequests, notifications, userProgress] = await Promise.all([
			sqlManager.find(AuthenticationRequest, {
				where: [{ trainee: user }, { consultant: user }],
			}),
			notificationRepo.find({ where: { user } }),
			sqlManager.find(UserProgress, { where: { user } }),
		]);

		await Promise.all([
			sqlManager.remove(AuthenticationRequest, authRequests),
			sqlManager.remove(notificationRepo.metadata.target, notifications),
			sqlManager.remove(UserProgress, userProgress),
		]);

		await sqlManager.delete(User, id);
	});

	await ratingRepo.deleteMany({ userId: id });

	await surgeryLogsRepo.bulkWrite([
		{
			updateMany: {
				filter: { leadSurgeon: id },
				update: { $unset: { leadSurgeon: "" } } as any,
			},
		},

		{
			updateMany: {
				filter: { "doctorsTeam.doctorId": id },
				update: {
					$pull: {
						doctorsTeam: {
							doctorId: id,
						} as never,
					},
				},
			},
		},
	]);

	res.status(204).end();
};
