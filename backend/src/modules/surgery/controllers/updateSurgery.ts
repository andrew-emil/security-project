import { Request, Response } from "express";
import { updateSurgerySchema } from "../../../utils/zodSchemas.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import {
	postSurgeryRepo,
	requirementRepo,
	surgeryLogsRepo,
} from "../../../config/repositories.js";
import { AppDataSource } from "../../../config/data-source.js";
import { Surgery } from "../../../entity/sql/Surgery.js";
import { In } from "typeorm";
import { SurgeryEquipment } from "../../../entity/sql/SurgeryEquipments.js";
import {
	notificationService,
	trainingService,
} from "../../../config/initializeServices.js";
import {
	NOTIFICATION_TYPES,
	PARTICIPATION_STATUS,
	STATUS,
} from "../../../utils/dataTypes.js";
import { ProcedureType } from "../../../entity/sql/ProcedureType.js";
import { Affiliations } from "../../../entity/sql/Affiliations.js";
import { Department } from "../../../entity/sql/departments.js";

export const updateSurgery = async (req: Request, res: Response) => {
	const validation = updateSurgerySchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const {
		surgeryId,
		hospitalId,
		departmentId,
		name,
		leadSurgeon,
		procedureTypeId,
		date,
		time,
		estimatedEndTime,
		surgeryEquipments,
		slots,
		cptCode,
		icdCode,
		patientBmi,
		patientComorbidity,
		patientDiagnosis,
		surgicalTimeMinutes,
		outcome,
		complications,
		dischargeStatus,
		doctorsTeam,
		caseNotes,
	} = validation.data;
	let warning: string;
	const logUpdatedData = {
		leadSurgeon,
		date,
		time,
		estimatedEndTime,
		slots,
		cptCode,
		icdCode,
		patientBmi,
		patientComorbidity,
		patientDiagnosis,
	};

	const queryRunner = AppDataSource.createQueryRunner();
	await queryRunner.connect();
	await queryRunner.startTransaction();

	try {
		const surgery = await queryRunner.manager.findOne(Surgery, {
			where: { id: surgeryId },
			relations: ["procedure", "department", "hospital", "surgeryEquipments"],
			lock: { mode: "pessimistic_write" },
		});

		if (!surgery) {
			res.status(404).json({
				message: "Surgery record not found",
			});
			return;
		}

		if (hospitalId) {
			const hospital = await queryRunner.manager.findOne(Affiliations, {
				where: {
					id: hospitalId,
					departments: {
						id: departmentId ? departmentId : surgery.department.id,
					},
				},
				relations: {
					departments: true,
				},
			});
			if (!hospital) {
				throw Error("Affiliation not found");
			}

			surgery.hospital = hospital;
		}

		if (departmentId) {
			const department = await queryRunner.manager.findOne(Department, {
				where: {
					id: departmentId,
				},
			});
			if (!department) {
				throw Error("Department not found in this Affiliation");
			}

			surgery.department = department;
		}

		if (name) surgery.name = name;

		if (surgeryEquipments) {
			const equipment = await queryRunner.manager.find(SurgeryEquipment, {
				where: { id: In(surgeryEquipments) },
			});

			if (equipment.length !== surgeryEquipments.length) {
				throw new Error("One or more equipment items not found");
			}

			surgery.surgeryEquipments = equipment;
		}

		let oldProcedureType: ProcedureType | null = null;
		if (procedureTypeId && surgery.procedure?.id !== procedureTypeId) {
			const newProcedureType = await queryRunner.manager.findOne(
				ProcedureType,
				{
					where: { id: procedureTypeId },
					relations: ["category"],
				}
			);
			if (!newProcedureType) throw new Error("Invalid procedure type");

			oldProcedureType = surgery.procedure;
			surgery.procedure = newProcedureType;
		}

		const updatedSurgery = await queryRunner.manager.save(surgery);

		if (doctorsTeam && surgery.procedure) {
			const roleRequirements = await requirementRepo.find({
				where: {
					role: { id: In(doctorsTeam.map((t) => t.roleId)) },
					procedure: { id: surgery.procedure.id },
				},
			});

			const invalidRoles = doctorsTeam.filter((t) => {
				const req = roleRequirements.find((r) => r.role.id === t.roleId);
				return !req || req.procedure.category !== surgery.procedure.category;
			});

			if (invalidRoles.length > 0) {
				warning =
					"Some team member roles are not qualified for this procedure type";
			}
		}

		const previousLog = await surgeryLogsRepo.findOne({
			where: {
				surgeryId: { $eq: surgeryId },
			},
		});
		const previousDoctors = previousLog?.doctorsTeam || [];

		if (doctorsTeam || procedureTypeId) {
			const currentDoctorIds =
				doctorsTeam?.map((d) => d.doctorId) ||
				previousLog.doctorsTeam.map((d) => d.doctorId);
			const previousDoctorIds = previousDoctors.map((d) => d.doctorId);

			if (surgery.procedure) {
				currentDoctorIds.filter((id) => !previousDoctorIds.includes(id));
				const removedDoctors = previousDoctorIds.filter(
					(id) => !currentDoctorIds.includes(id)
				);

				if (oldProcedureType) {
					await trainingService.adjustProgress(
						queryRunner,
						currentDoctorIds,
						oldProcedureType,
						-1
					);
				}

				await trainingService.adjustProgress(
					queryRunner,
					currentDoctorIds,
					surgery.procedure,
					1
				);

				await trainingService.adjustProgress(
					queryRunner,
					removedDoctors,
					surgery.procedure,
					-1
				);
			}

			const updatedDoctorsTeam = doctorsTeam.map((doctor) => {
				return {
					...doctor,
					participationStatus: PARTICIPATION_STATUS.APPROVED,
				};
			});

			await surgeryLogsRepo.updateOne(
				{ surgeryId },
				{
					$push: {
						doctorsTeam: {
							$each: updatedDoctorsTeam,
						},
					} as any,
				},
				{ upsert: true }
			);
		}
		const scheduleUpdated = Boolean(logUpdatedData.date || logUpdatedData.time);

		const filteredLogData = Object.entries(logUpdatedData).reduce(
			(acc, [key, value]) => {
				if (value !== null && value !== undefined) {
					acc[key] = value;
				}
				return acc;
			},
			{} as Record<string, any>
		);
		const logUpdate = { ...filteredLogData, updatedAt: new Date() };
		await surgeryLogsRepo.updateOne(
			{ surgeryId },
			{ $set: logUpdate },
			{ upsert: true }
		);

		const postSurgery = await postSurgeryRepo.findOne({
			where: {
				surgeryId,
			},
		});

		if (postSurgery) {
			postSurgery.outcome = outcome ? outcome : postSurgery.outcome;
			postSurgery.caseNotes = caseNotes ? caseNotes : postSurgery.caseNotes;
			postSurgery.complications = complications
				? complications
				: postSurgery.complications;
			postSurgery.surgicalTimeMinutes = surgicalTimeMinutes
				? surgicalTimeMinutes
				: postSurgery.surgicalTimeMinutes;
			if (dischargeStatus) {
				postSurgery.dischargeStatus = dischargeStatus;
				postSurgery.dischargedAt = new Date();
			}

			await postSurgeryRepo.save(postSurgery);
		}

		await queryRunner.commitTransaction();

		const surgeryLog = await surgeryLogsRepo.findOne({
			where: {
				surgeryId,
			},
		});

		if (
			scheduleUpdated &&
			doctorsTeam &&
			surgeryLog.status === STATUS.COMPLETED
		) {
			const newDate = logUpdatedData.date || previousLog.date;
			const newTime = logUpdatedData.time || previousLog.time;
			const scheduleDateTime = new Date(`${newDate} ${newTime}`);
			const formattedSchedule = scheduleDateTime.toLocaleString("en-US", {
				dateStyle: "medium",
				timeStyle: "short",
			});

			const updatedAssigned: string[] = [];
			const newAssigned: string[] = [];

			doctorsTeam.forEach((doctor: { doctorId: string }) => {
				if (
					previousDoctors.some(
						(prev: { doctorId: string }) => prev.doctorId === doctor.doctorId
					)
				) {
					updatedAssigned.push(doctor.doctorId);
				} else {
					newAssigned.push(doctor.doctorId);
				}
			});

			await Promise.all(
				updatedAssigned.map((doctorId) =>
					notificationService.createNotification(
						doctorId,
						NOTIFICATION_TYPES.SCHEDULE_UPDATE,
						`Surgery: ${updatedSurgery.name} schedule updated to ${formattedSchedule}<br>
						Hospital: ${updatedSurgery.hospital.name}`
					)
				)
			);

			await Promise.all(
				newAssigned.map((doctorId) =>
					notificationService.createNotification(
						doctorId,
						NOTIFICATION_TYPES.INVITE,
						`You have been assigned to Surgery: ${updatedSurgery.name} scheduled on ${formattedSchedule}<br>
						Hospital: ${updatedSurgery.hospital.name}<br>
						Please review the surgery and contact the Consultant for any questions`
					)
				)
			);
		}

		res.status(200).json({
			success: true,
			message: "Surgery details updated successfully",
			warning,
		});
	} catch (error) {
		await queryRunner.rollbackTransaction();
		throw error;
	} finally {
		await queryRunner.release();
	}
};
