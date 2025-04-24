import { Response, Request } from "express";
import {
	authService,
	formatService,
	userService,
} from "../../../config/initializeServices.js";

export const verify2FA = async (req: Request, res: Response) => {
	const { email, otp } = req.body;

	if (!email || !otp) throw Error("Invalid credentials");

	const result = await userService.verify2FA(email, otp);

	if (!result.success) {
		res.status(400).json(result);
		return;
	}

	const { accessToken, refreshToken } = authService.generateToken(
		result.newUser.id,
		result.newUser.email
	);

	await authService.storeRefreshToken(result.newUser, refreshToken);

	const formattedUser = formatService.formatUserData(result.newUser)

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 60 * 24 * 60 * 60 * 1000,
	});

	res.status(200).json({
		success: result.success,
		message: "Verification successful",
		token: accessToken,
		user: formattedUser,
	});
};
