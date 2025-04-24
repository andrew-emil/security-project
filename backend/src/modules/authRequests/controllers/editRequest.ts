import { Request, Response } from "express";
import { editRequestSchema } from "../../../utils/zodSchemas.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import {
	authenticationRequestRepo,
	surgeryLogsRepo,
	surgeryRepo,
	surgicalRolesRepo,
	userRepo,
} from "../../../config/repositories.js";

export const editRequest = async (req: Request, res: Response) => {
	const validation = editRequestSchema.safeParse(req.body);

	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { surgeryId, traineeId, roleId, notes } = validation.data;

	if (req.user.id !== traineeId) throw Error("Unauthorized");

	const [surgery, trainee] = await Promise.all([
		surgeryRepo.findOne({
			where: {
				id: surgeryId,
			},
			relations: ["procedure"],
		}),
		userRepo.findOneBy({
			id: traineeId,
		}),
	]);

	if (!surgery) throw Error("Surgery not Found");
	if (!trainee) throw Error("Invalid user data");

	const authRequest = await authenticationRequestRepo.findOne({
		where: {
			surgery: { id: surgeryId },
			trainee: { id: traineeId },
		},
		relations: ["requestedRole"],
	});
	if (!authRequest) throw Error("Request Not Found");

	if (roleId) {
		const role = await surgicalRolesRepo.findOneBy({ id: roleId });
		if (!role) throw Error("Role Not Found");

		authRequest.requestedRole = role;
	}

	if (typeof notes !== "undefined") {
		const surgeryLog = await surgeryLogsRepo.findOneBy({
			surgeryId: surgeryId,
		});
		if (!surgeryLog) throw Error("Surgery log Not Found");

		const doctorEntry = surgeryLog.doctorsTeam.find(
			(doctor) => doctor.doctorId === traineeId
		);
		if (!doctorEntry) throw Error("Doctor Not Found in surgery log");

		if (typeof notes !== "undefined") doctorEntry.notes = notes;

		if (roleId) doctorEntry.roleId = authRequest.requestedRole.id;

		await Promise.all([
			authenticationRequestRepo.save(authRequest),
			surgeryLogsRepo.update(
				{ surgeryId: surgeryLog.surgeryId },
				{ doctorsTeam: surgeryLog.doctorsTeam }
			),
		]);
	} else {
		await authenticationRequestRepo.save(authRequest);
	}

	res.status(200).json({
		success: true,
		message: "Request updated successfully",
	});
};
