import { Request, Response } from "express";
import { addAffiliationSchema } from "../../../utils/zodSchemas.js";
import { affiliationRepo } from "../../../config/repositories.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";

export const addAffiliation = async (req: Request, res: Response) => {
	const validation = addAffiliationSchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { name, country, city, address, institution_type } = validation.data;

	const existingAffiliation = await affiliationRepo.findOne({
		where: { name, country, city, address },
	});

	if (existingAffiliation) {
		res
			.status(409)
			.json({ success: false, message: "Affiliation already exists" });
		return;
	}

	const newAffiliation = affiliationRepo.create({
		name,
		country,
		city,
		address,
		institution_type: institution_type
	});

	await affiliationRepo.save(newAffiliation);

	res.status(201).json({
		success: true,
		message: "Affiliation created successfully",
	});
};
