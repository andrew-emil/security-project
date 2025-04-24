import { Response, Request } from "express";
import { loginSchema } from "../../../utils/zodSchemas.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import { userService } from "../../../config/initializeServices.js";

export const login = async (req: Request, res: Response): Promise<void> => {
	const validation = loginSchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { email, password } = validation.data;

	const authResult = await userService.login(email, password);

	if (!authResult.success) {
		res.status(400).json(authResult);
		return;
	}

	const otpResult = await userService.sendOtp(authResult.user);

	res.status(202).json({ otpResult });
};
