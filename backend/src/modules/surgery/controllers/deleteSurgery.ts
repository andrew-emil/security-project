import { Request, Response } from "express";
import {
	authenticationRequestRepo,
	postSurgeryRepo,
	surgeryLogsRepo,
	userProgressRepo,
} from "../../../config/repositories.js";
import { AppDataSource } from "../../../config/data-source.js";
import { Surgery } from "../../../entity/sql/Surgery.js";
import { In } from "typeorm";
import { trainingService } from "../../../config/initializeServices.js";

export const deleteSurgery = async (req: Request, res: Response) => {
	const surgeryId = parseInt(req.params.id);
	if (isNaN(surgeryId)) throw Error("Invalid surgery ID format");

	const queryRunner = AppDataSource.createQueryRunner();
	await queryRunner.connect();
	await queryRunner.startTransaction();

	try {
		const surgery = await queryRunner.manager.findOne(Surgery, {
			where: { id: surgeryId },
			relations: ["procedure", "surgeryEquipments"],
		});

		if (!surgery) {
			throw Error("Surgery record not found");
		}

		if (surgery.surgeryEquipments && surgery.surgeryEquipments.length > 0) {
			await queryRunner.manager
				.createQueryBuilder()
				.delete()
				.from("surgery_equipment_mapping")
				.where("surgeryId = :surgeryId", { surgeryId })
				.execute();
		}

		const surgeryLog = await surgeryLogsRepo.findOneBy({ surgeryId });

		if (surgeryLog && surgery.procedure) {
			const participantIds = surgeryLog.doctorsTeam.map((d) => d.doctorId);

			const progressEntries = await userProgressRepo.find({
				where: {
					user: { id: In(participantIds) },
					procedure: { id: surgery.procedure.id },
				},
			});

			for (const entry of progressEntries) {
				if (entry.completedCount > 0) {
					entry.completedCount -= 1;
					await queryRunner.manager.save(entry);
				} else {
					await queryRunner.manager.remove(entry);
				}
			}
		}

		await Promise.all([
			queryRunner.manager.delete(Surgery, surgeryId),
			surgeryLogsRepo.delete({ surgeryId }),
			postSurgeryRepo.delete({ surgeryId }),
			authenticationRequestRepo.delete({ surgery: { id: surgeryId } }),
			trainingService.removeSurgeryRecords(surgeryId),
		]);
		await queryRunner.commitTransaction();

		res.status(204).end();
	} catch (error) {
		await queryRunner.rollbackTransaction();
		res.status(500).json({
			success: false,
			message: error instanceof Error ? error.message : "something went wrong",
		});
	} finally {
		await queryRunner.release();
	}
};
