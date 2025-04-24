import { Request, Response } from "express";
import { AppDataSource } from "../../../config/data-source.js";
import { SurgeryEquipment } from "../../../entity/sql/SurgeryEquipments.js";

export const deleteEquipment = async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);
	if (isNaN(id) || id < 1) throw new Error("Invalid equipment ID");

	await AppDataSource.transaction(async (manager) => {
		const equipment = await manager.findOne(SurgeryEquipment, {
			where: { id },
			relations: ["surgery"],
		});

		if (!equipment) {
			throw new Error("Equipment not found");
		}

		if (equipment.surgery && equipment.surgery.length > 0) {
			await manager
				.createQueryBuilder()
				.relation(SurgeryEquipment, "surgery")
				.of(id)
				.remove(equipment.surgery.map((s) => s.id));
		}

		await manager.delete(SurgeryEquipment, { id });
	});

	res.status(204).json({
		success: true,
		message: "Surgery Equipment deleted successfully.",
	});
};
