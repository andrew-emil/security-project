import { Request, Response } from "express";
import {
	authenticationRequestRepo,
	roleRepo,
	surgeryLogsRepo,
	surgeryRepo,
	surgicalRolesRepo,
	userRepo,
} from "../../../config/repositories.js";
import { AuthenticationRequest } from "../../../entity/sql/AuthenticationRequests.js";
import {
	Authentication_Request,
	NOTIFICATION_TYPES,
} from "../../../utils/dataTypes.js";
import { createRequestSchema } from "../../../utils/zodSchemas.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import { DoctorsTeam } from "../../../entity/sub entity/DoctorsTeam.js";
import { notificationService } from "../../../config/initializeServices.js";

export const createRequest = async (req: Request, res: Response) => {
	const validation = createRequestSchema.safeParse(req.body);
	if (!validation.success) {
		throw Error(formatErrorMessage(validation), { cause: validation.error });
	}

	const { surgeryId, traineeId, consultantId, roleId, notes } = validation.data;

	const [surgery, consultantRole, trainee, consultant, role] =
		await Promise.all([
			surgeryRepo.findOne({
				where: { id: surgeryId },
				relations: ["procedure"],
			}),
			roleRepo.findOneBy({ name: "Consultant" }),
			userRepo.findOneBy({ id: traineeId }),
			userRepo.findOneBy({ id: consultantId }),
			surgicalRolesRepo.findOneBy({ id: roleId }),
		]);

	if (!surgery) throw Error("Surgery Not Found");
	if (!consultantRole) throw Error("Consultant role Not Found");
	if (!trainee) throw Error("Invalid trainee data");
	if (!consultant) throw Error("Invalid consultant data");
	if (!role) throw Error("Invalid role");

	const existingRequest = await authenticationRequestRepo.findOne({
		where: {
			surgery: { id: surgeryId },
			trainee: { id: traineeId },
			consultant: { id: consultantId },
			status: Authentication_Request.PENDING,
		},
	});

	if (existingRequest) {
		res.status(409).json({
			success: false,
			message: "A pending request already exists for this surgery",
		});
		return;
	}

	const authRequest = new AuthenticationRequest();
	authRequest.surgery = surgery;
	authRequest.trainee = trainee;
	authRequest.consultant = consultant;
	authRequest.requestedRole = role;
	authRequest.status = Authentication_Request.PENDING;

	const doctor = new DoctorsTeam(traineeId, role.id, null, notes);

	const surgeryLog = await surgeryLogsRepo.findOneBy({
		surgeryId: surgeryId,
	});

	if (!surgeryLog) {
		throw Error("Surgery log not found");
	}

	surgeryLog.doctorsTeam.push(doctor);

	await Promise.all([
		notificationService.createNotification(
			consultant.id,
			NOTIFICATION_TYPES.AUTH_REQUEST,
			`New request from DR.${trainee.first_name} ${trainee.last_name} for ${surgery.name} (${surgery.procedure.name})`
		),
		authenticationRequestRepo.save(authRequest),
		surgeryLogsRepo.save(surgeryLog),
	]);

	res.status(201).json({
		success: true,
		message: "Request created successfully",
	});
};
