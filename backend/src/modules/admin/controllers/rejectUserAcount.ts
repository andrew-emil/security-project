import { Request, Response } from "express";
import { userRepo } from "../../../config/repositories.js";
import { USER_STATUS } from "../../../utils/dataTypes.js";

export const rejectUserAccount = async (req: Request, res: Response) => {
	const userId = req.params.userId;
	const activationToken = req.query.activationToken as string;
	const { rejectionReason } = req.body;

	if (!userId || !activationToken) {
		res.status(400).json({
			success: false,
			message: "Missing user ID or activation token",
		});
		return;
	}

	if (!rejectionReason?.trim()) {
		res.status(400).json({
			success: false,
			message: "Rejection reason is required",
		});
		return;
	}

	const user = await userRepo.findOneBy({ id: userId });
	if (!user) throw Error("User not found");

	if (user.account_status === USER_STATUS.INACTIVE) {
		res.status(400).json({
			success: false,
			message: "Account is already rejected",
		});
		return;
	}

	if (activationToken !== user.activation_token) {
		res.status(400).json({
			success: false,
			message: "Invalid activation token",
		});
		return;
	}

	user.account_status = USER_STATUS.INACTIVE;
	user.activation_token = null;
	user.token_expiry = null;
	user.rejectionReason = rejectionReason;
	await userRepo.save(user);

	res.status(200).json({
		success: true,
		message: "User account rejected successfully",
	});
};
