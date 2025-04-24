import { Request, Response } from "express";
import { surgeryEquipmentRepo } from "../../../config/repositories.js";

export const getEquipmentById = async (req: Request, res: Response) => {
	const parseId = parseInt(req.params.id);

	if (isNaN(parseId)) throw Error("Invalid Id format");

	const surgeryEquipment = await surgeryEquipmentRepo.findOne({
		where: {
			id: parseId,
		},
	});

	if (!surgeryEquipment) throw Error("Surgery Equipment not found");

	res.status(200).json(surgeryEquipment);
};
