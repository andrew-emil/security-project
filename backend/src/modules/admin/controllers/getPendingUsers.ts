import { Request, Response } from "express";
import { USER_STATUS } from "../../../utils/dataTypes.js";
import { userRepo } from "../../../config/repositories.js";

export const getPendingUsers = async (req: Request, res: Response) => {
	const users = await userRepo
		.createQueryBuilder("user")
		.leftJoinAndSelect("user.role", "role")
		.leftJoinAndSelect("user.affiliation", "affiliation")
		.leftJoinAndSelect("user.department", "department")
		.select([
			"user.id",
			"user.first_name",
			"user.last_name",
			"user.email",
			"user.phone_number",
			"user.picture",
			"user.created_at",
			"user.activation_token",
			"role.name",
			"affiliation.name",
			"department.name",
		])
		.where("user.account_status = :status", { status: USER_STATUS.PENDING })
		.orderBy("user.created_at", "ASC")
		.getMany();

	const sanitizedUsers = users.map((user) => ({
		...user,
		picture: user.picture,
		role: user.role.name,
		affiliation: user.affiliation.name,
		department: user.department.name,
	}));

	res.status(200).json({
		success: true,
		message:
			sanitizedUsers.length === 0
				? "No pending user accounts found"
				: "Pending users retrieved successfully",
		data: sanitizedUsers,
	});
};
