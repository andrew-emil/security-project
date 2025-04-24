import { Request, Response } from "express";
import { AppDataSource } from "../../../config/data-source.js";
import {
	affiliationRepo,
	departmentRepo,
	surgeryRepo,
	userRepo,
} from "../../../config/repositories.js";

export const deleteAffiliation = async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);

	if (isNaN(id)) throw Error("Invalid Affiliation ID");

	const affiliation = await affiliationRepo.findOne({
		where: { id },
		relations: ["users", "departments"],
	});

	if (!affiliation) throw Error("Invalid Affiliation ID");

	await AppDataSource.transaction(async (transactionManager) => {
		await transactionManager.update(
			surgeryRepo.target,
			{ hospital: affiliation },
			{ hospital: null }
		);

		await transactionManager.update(
			userRepo.target,
			{ affiliation },
			{ affiliation: null }
		);

		await transactionManager.delete(departmentRepo.target, { affiliation });

		const result = await transactionManager.delete(affiliationRepo.target, id);

		if (result.affected === 0) throw Error("Internal server error");
	});

	res.status(204).json({
		sucess: true,
		message: "Affiliation deleted successfully",
	});
};
