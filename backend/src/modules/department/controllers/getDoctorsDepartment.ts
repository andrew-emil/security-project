import { Request, Response } from "express";
import { departmentRepo, userRepo } from "../../../config/repositories.js";

export const getDoctorsDepartment = async (req: Request, res: Response) => {
	const { id } = req.params;
	if (!id || isNaN(parseInt(id))) throw Error("Invalid department Id");

	const departmentId = parseInt(id);
	const department = await departmentRepo.findOneBy({ id: departmentId });

	if (!department) throw Error("No department Found");

	const doctors = await userRepo.find({
		where: {
			department: { id: departmentId },
		},
		relations: ["role"],
	});

	if (!doctors || doctors.length === 0) throw Error("No Doctors found");

	const formattedDoctors = doctors.map((doctor) => ({
		id: doctor.id,
		name: `${doctor.first_name} ${doctor.last_name}`,
		email: doctor.email,
		phoneNumber: doctor.phone_number,
		role: doctor.role?.name || "Unknown",
	}));

	res.status(200).json({
		doctors: formattedDoctors,
	});
};
