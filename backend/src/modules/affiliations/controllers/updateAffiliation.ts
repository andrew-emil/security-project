import { Request, Response } from "express";
import { updateAffiliationSchema } from "../../../utils/zodSchemas.js";
import { affiliationRepo } from "../../../config/repositories.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";

export const updateAffiliation = async (req: Request, res: Response) => {
	const validation = updateAffiliationSchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { id, institution_type, ...updateData } = validation.data;

	const affiliationId = parseInt(id);
	if (isNaN(parseInt(id))) throw Error("Invalid Affiliation Id");

	const affiliation = await affiliationRepo.findOne({
		where: { id: affiliationId },
		relations: ["departments"],
	});
	if (!affiliation) throw Error("Affiliation Not Found");

	Object.assign(affiliation, updateData);

	if (institution_type) affiliation.institution_type = institution_type;

	await affiliationRepo.save(affiliation);

	res.status(200).json({
		success: true,
		message: "Affiliation updated successfully",
	});
};
