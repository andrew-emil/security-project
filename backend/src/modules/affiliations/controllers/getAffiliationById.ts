import { Request, Response } from "express";
import { affiliationRepo } from "../../../config/repositories.js";

export const getAffiliationById = async (req: Request, res: Response) => {
	const affiliationId = parseInt(req.params.id);
	if (isNaN(affiliationId)) throw Error("Invalid Affiliation Id Format");

	const affiliation = await affiliationRepo.findOne({
		where: {
			id: affiliationId,
		},
		relations: ["departments"],
	});

	if (!affiliation) throw Error("Affiliation not found");

	res.status(200).json(affiliation);
};
