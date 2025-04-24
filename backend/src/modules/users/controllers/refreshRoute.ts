import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userRepo } from "../../../config/repositories.js";
import { authService } from "../../../config/initializeServices.js";
import { JWTPayload } from "../../../utils/dataTypes.js";

export const refreshRoute = async (req: Request, res: Response) => {
	const refreshToken = req.cookies.refreshToken;
	
	if (!refreshToken) {
		res.status(401).json({ message: "No refresh token provided" });
		return;
	}

	let decoded: JWTPayload;
	try {
		decoded = jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET!
		) as JWTPayload;
	} catch (error) {
		res.status(403).json({ message: "Invalid or expired refresh token" });
		return;
	}

	const user = await userRepo.findOne({
		where: { id: decoded.id },
		relations: ["role"],
	});
	if (!user) {
		res.status(404).json({ message: "User not found" });
		return;
	}

	const isValid = await authService.validateRefreshToken(user.id, refreshToken);
	if (!isValid) {
		res.status(403).json({ message: "Invalid refresh token" });
		return;
	}

	const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
		authService.generateToken(user.id, user.role.name);

	await authService.storeRefreshToken(user, newRefreshToken);

	res.cookie("refreshToken", newRefreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 24 * 60 * 60 * 1000,
	});

	

	res.status(200).json({ accessToken: newAccessToken });
};
