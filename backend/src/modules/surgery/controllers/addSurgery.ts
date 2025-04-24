import { Request, Response } from "express";
import {
	affiliationRepo,
	departmentRepo,
	surgeryLogsRepo,
	surgeryRepo,
	userRepo,
	roleRepo,
	surgeryEquipmentRepo,
	procedureTypeRepo,
	requirementRepo,
	userProgressRepo,
	surgicalRolesRepo,
} from "../../../config/repositories.js";
import { PatientDetails } from "../../../entity/sub entity/PatientDetails.js";
import { addSurgerySchema } from "../../../utils/zodSchemas.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import { AppDataSource } from "../../../config/data-source.js";
import { In } from "typeorm";
import { DoctorsTeam } from "../../../entity/sub entity/DoctorsTeam.js";
import { Surgery } from "../../../entity/sql/Surgery.js";
import { SurgeryLog } from "../../../entity/mongodb/SurgeryLog.js";
import { trainingService } from "../../../config/initializeServices.js";
import { STATUS } from "../../../utils/dataTypes.js";

export const addSurgery = async (req: Request, res: Response) => {
	const validation = addSurgerySchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const {
		hospitalId,
		departmentId,
		name,
		leadSurgeon,
		slots,
		doctorsTeam,
		surgeryEquipments,
		procedureTypeId,
		date,
		time,
		cptCode,
		icdCode,
		patientBmi,
		patientComorbidity,
		patientDiagnosis,
	} = validation.data;
	let surgery: Surgery;
	let surgeryLog: SurgeryLog;

	try {
		const [
			hospital,
			department,
			leadSurgeonEntity,
			procedureType,
			doctorsTeamRoles,
		] = await Promise.all([
			affiliationRepo.findOneBy({ id: hospitalId }),
			departmentRepo.findOneBy({ id: departmentId }),
			userRepo.findOne({
				where: { id: leadSurgeon },
				relations: ["role"],
			}),
			procedureTypeRepo.findOne({
				where: { id: procedureTypeId },
			}),
			userRepo.find({
				where: {
					id: In(doctorsTeam.map((t) => t.doctorId)),
				},
				relations: ["role"],
				select: {
					id: true,
					role: {
						id: true,
						name: true,
					},
				},
			}),
		]);

		const roleRequirements = await requirementRepo.find({
			where: {
				role: { id: In(doctorsTeamRoles.map((t) => t.role.id)) },
				procedure: { id: procedureTypeId },
			},
			relations: ["role", "procedure"],
		});

		if (!hospital) throw new Error("Hospital Not Found");
		if (!department) throw new Error("Department Not Found");
		if (!leadSurgeonEntity?.role)
			throw new Error("Lead surgeon role Not Found");
		if (!procedureType) {
			throw new Error("Invalid procedure type");
		}

		const doctorIds = doctorsTeam.map((p) => p.doctorId);
		const roleIds = doctorsTeam.map((p) => p.roleId);

		const [existingUsers, existingRoles] = await Promise.all([
			userRepo.find({ where: { id: In(doctorIds) }, relations: ["role"] }),
			surgicalRolesRepo.findBy({ id: In(roleIds) }),
		]);

		if (existingUsers.length !== doctorsTeam.length)
			throw new Error(`Invalid doctors`);

		if (existingRoles.length !== new Set(roleIds).size)
			throw new Error(`Invalid roles`);

		const surgeryEquipmentsArray = await Promise.all(
			surgeryEquipments.map(async (equipment) => {
				const equip = await surgeryEquipmentRepo.findOneBy({ id: equipment });
				if (!equip) throw Error(`Invalid equipment ID: ${equipment}`);

				return equip;
			})
		);

		if (slots < doctorIds.length) {
			res.status(400).json({
				success: false,
				message: `Surgery slots is ${slots} can not have ${doctorIds.length} doctors`,
			});
			return;
		}

		const invalidRoles = existingUsers.filter((user) => {
			const req = roleRequirements.find((r) => r.role.id === user.role.id);
			return !req || req.procedure.category !== procedureType.category;
		});

		let warning: string;

		if (invalidRoles.length > 0) {
			warning = `some Team members roles not qualified for ${procedureType.category} procedures`;
		}

		await AppDataSource.transaction(async (transactionalEntityManager) => {
			surgery = transactionalEntityManager.create(Surgery, {
				department,
				hospital,
				lead_surgeon: leadSurgeonEntity,
				name,
				surgeryEquipments: surgeryEquipmentsArray,
				procedure: procedureType,
			});

			await transactionalEntityManager.save(surgery);

			const patient = new PatientDetails(
				patientBmi,
				patientComorbidity,
				patientDiagnosis
			);

			surgeryLog = new SurgeryLog();
			surgeryLog.surgeryId = surgery.id;
			surgeryLog.doctorsTeam = doctorsTeam.map((doctor) => {
				return new DoctorsTeam(
					doctor.doctorId,
					doctor.roleId,
					doctor.participationStatus,
					doctor.notes
				);
			});
			surgeryLog.leadSurgeon = leadSurgeonEntity.id;
			surgeryLog.slots = slots;
			surgeryLog.status = STATUS.ONGOING;
			surgeryLog.date = new Date(date);
			surgeryLog.time = time;
			surgeryLog.cptCode = cptCode;
			surgeryLog.icdCode = icdCode;
			surgeryLog.patient_details = patient;

			surgeryLog.trainingCredits =
				await trainingService.initializeSurgeryRecords(
					doctorsTeam.map((d) => ({
						userId: d.doctorId,
						roleId: d.roleId,
					})),
					leadSurgeonEntity.id
				);

			await surgeryLogsRepo.save(surgeryLog);

			const progressUpdates = doctorsTeam.map(async (doctor) => {
				const doctorRole = await userRepo.findOne({
					where: { id: In(doctorIds) },
					relations: ["role"],
					select: {
						id: true,
						role: {
							id: true,
						},
					},
				});
				const requirement = roleRequirements.find(
					(r) => r.role.id === doctorRole.role.id
				);
				if (!requirement) return;

				const progress = await userProgressRepo.findOne({
					where: {
						user: { id: doctor.doctorId },
						procedure: { id: procedureTypeId },
					},
				});

				if (progress) {
					progress.completedCount += 1;
				} else {
					const newProgress = userProgressRepo.create({
						user: { id: doctor.doctorId },
						procedure: procedureType,
						completedCount: 1,
					});
					await transactionalEntityManager.save(newProgress);
				}
			});

			await Promise.all(progressUpdates);
		});

		res.status(201).json({
			success: true,
			message: `Surgery created successfully, ${warning}`,
		});
	} catch (error) {
		if (surgery?.id) await surgeryRepo.delete(surgery.id);
		if (surgeryLog?.id) await surgeryLogsRepo.delete(surgeryLog.id);

		res.status(400).json({
			success: false,
			message: error.message,
			errorDetails: error.stack?.split("\n")[0],
		});
	}
};
