import { Request, Response } from "express";
import { userRepo } from "../../../config/repositories.js";
import { USER_STATUS } from "../../../utils/dataTypes.js";

export const approveUserAccount = async (req: Request, res: Response) => {
	const userId = req.params.userId;
	const activationToken = req.query.activationToken as string;
	console.log(userId, activationToken)
	if (!userId || !activationToken) throw new Error("Invalid token");

	const user = await userRepo.findOneBy({
		id: userId,
	});

	if (!user) throw Error("User not found");

	if (user.account_status === USER_STATUS.ACTIVE) {
		res.status(400).json({
			success: false,
			message: "Account is already active",
		});
		return;
	}

	if (activationToken !== user.activation_token)
		throw new Error("Invalid token");

	user.account_status = USER_STATUS.ACTIVE;
	user.activation_token = null;
	user.token_expiry = null;
	await userRepo.save(user);

	res
		.status(200)
		.json({ success: true, message: "User approved successfully" });
};
