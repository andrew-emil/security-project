import { Request, Response } from "express";
import { addPostSurgerySchema } from "../../../utils/zodSchemas.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import {
	postSurgeryRepo,
	surgeryRepo,
	surgeryLogsRepo,
	authenticationRequestRepo,
} from "../../../config/repositories.js";
import { Authentication_Request, STATUS } from "../../../utils/dataTypes.js";
import { trainingService } from "../../../config/initializeServices.js";
import { ObjectId } from "typeorm";
import logger from "../../../config/loggerConfig.js";
import { Surgery } from "../../../entity/sql/Surgery.js";

export const addPostSurgery = async (req: Request, res: Response) => {
	const validation = addPostSurgerySchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { surgeryId, ...postData } = validation.data;
	let savedPostSurgeryId: ObjectId | null = null;
	let originalAuthStatuses: Array<{
		id: number;
		status: Authentication_Request;
	}> = [];

	let surgery: Surgery;

	try {
		surgery = await surgeryRepo.findOne({ where: { id: surgeryId } });

		if (!surgery) {
			const missing = [];
			if (!surgery) missing.push("surgery");
			res.status(404).json({
				success: false,
				message: `Surgery records not found: Missing ${missing.join(" and ")}`,
			});
			return;
		}

		const existingPost = await postSurgeryRepo.findOneBy({ surgeryId });
		if (existingPost) {
			res.status(409).json({
				success: false,
				message:
					"Post-surgery documentation already completed for this procedure",
			});
			return;
		}

		const authRequests = await authenticationRequestRepo.find({
			where: { surgery: { id: surgeryId } },
		});
		originalAuthStatuses = authRequests.map((a) => ({
			id: a.id,
			status: a.status,
		}));

		const postSurgery = postSurgeryRepo.create({
			surgeryId,
			...postData,
			complications: postData.complications?.trim() || null,
			caseNotes: postData.caseNotes?.trim() || null,
		});

		await Promise.all([
			postSurgeryRepo.save(postSurgery),
			surgeryLogsRepo.update({ surgeryId }, { status: STATUS.COMPLETED }),
			authenticationRequestRepo.update(
				{ surgery: { id: surgeryId } },
				{ status: Authentication_Request.APPROVED }
			),
			trainingService.handleSurgeryCompletion(surgeryId),
		]);

		res.status(201).json({
			success: true,
			message: "Post-operative documentation completed successfully",
		});
	} catch (error) {
		try {
			if (savedPostSurgeryId) {
				await postSurgeryRepo.delete(savedPostSurgeryId);
				await surgeryLogsRepo.update({ surgeryId }, { status: STATUS.ONGOING });
			}
			if (originalAuthStatuses.length > 0) {
				await Promise.all(
					originalAuthStatuses.map(async ({ id, status }) =>
						authenticationRequestRepo.update({ id }, { status })
					)
				);
			}
			await trainingService.revertSurgeryCompletion(surgeryId);
		} catch (rollBackError) {
			logger.error("Post-surgery rollback failed");
		}

		res.status(500).json({
			success: false,
			message: "Failed to complete post-surgery documentation",
		});
	}
};
