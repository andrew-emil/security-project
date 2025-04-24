import { Request, Response } from "express";
import { AppDataSource } from "../../../config/data-source.js";
import { USER_STATUS } from "../../../utils/dataTypes.js";
import { User } from "../../../entity/sql/User.js";
import { Affiliations } from "../../../entity/sql/Affiliations.js";

export const getDataCount = async (req: Request, res: Response) => {
	let doctorsCount: number, affiliationCount: number, consultantCount: number;

	await AppDataSource.transaction(async (manager) => {
		[doctorsCount, affiliationCount, consultantCount] = await Promise.all([
			manager.count(User, {
				where: {
					account_status: USER_STATUS.ACTIVE,
				},
			}),
			manager.count(Affiliations),
			manager.count(User, {
				where: {
					account_status: USER_STATUS.ACTIVE,
					role: {
						name: "Consultant",
					},
				},
			}),
		]);
	});

	res.status(200).json({
		doctorsCount,
		affiliationCount,
		consultantCount,
	});
};
