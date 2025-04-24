import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../../../utils/dataTypes.js";
import { authService } from "../../../config/initializeServices.js";

export const logout = async (req: Request, res: Response) => {
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken) {
		res.status(204).end();
		return;
	}

	const decoded = jwt.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET!
	) as JWTPayload;

	await authService.revokeTokens(decoded.id);

	res.clearCookie("refreshToken", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});

	res.status(204).end();
};
