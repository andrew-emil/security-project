import { Request, Response } from "express";
import { userService } from "../../../config/initializeServices.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import { resetPasswordSchema } from "../../../utils/zodSchemas.js";

export const resetPassword = async (req: Request, res: Response) => {
	// #swagger.tags = ['Users']
	const validation = resetPasswordSchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { email, token, newPassword } = validation.data;

	const result = await userService.resetPassword(email, token, newPassword);

	if (!result.success) res.status(400).json(result);

	res.status(200).json({
		message: "Password resed successfully",
	});
};
