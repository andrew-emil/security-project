import { Request, Response } from "express";
import { affiliationRepo } from "../../../config/repositories.js";

export const getAffiliations = async (req: Request, res: Response) => {
	const page = Math.max(parseInt(req.query.page as string) || 1, 1);
	const take = 10;
	const skip = (page - 1) * take;

	const [affiliations, total] = await affiliationRepo.findAndCount({
		order: { name: "ASC" },
		take,
		skip,
	});

	if (total === 0) {
		res.status(404).json({ success: false, message: "No affiliations found" });
		return;
	}

	res.status(200).json({
		success: true,
		affiliations,
		page,
		total,
		totalPages: Math.ceil(total / take),
	});
};
