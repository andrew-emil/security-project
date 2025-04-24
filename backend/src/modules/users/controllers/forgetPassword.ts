import { Request, Response } from "express";
import { userService } from "../../../config/initializeServices.js";

export const forgetPassword = async (req: Request, res: Response) => {
	// #swagger.tags = ['Users']
	const { email } = req.body;

	if (!email) throw Error("Invalid credentials");

	await userService.forgetPassword(email);

	res.status(200).json({
		success: true,
		message: "If the email exists, a reset link will be sent.",
	});
};
