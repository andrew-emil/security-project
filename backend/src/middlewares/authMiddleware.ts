import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../utils/dataTypes.js";

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET as string;

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization;
		console.log(authHeader);
		if (!authHeader?.startsWith("Bearer ")) {
			res
				.status(401)
				.json({ message: "Authorization header missing or invalid" });
			return;
		}

		const token = authHeader.split(" ")[1];
		if (!token) {
			res.status(401).json({ message: "Authentication token missing" });
			return;
		}

		const decoded = jwt.verify(token, SECRET_KEY) as JWTPayload;
		req.user = decoded;
		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			res.status(401).json({ message: "Token expired" });
			return;
		}
		if (error instanceof jwt.JsonWebTokenError) {
			res.status(401).json({ message: "Invalid token" });
			return;
		}
		next(error);
	}
};

export const authUser = (allowedRoles: string[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		const roleSet = new Set(allowedRoles.map((role) => role.toLowerCase()));
		console.log(roleSet);
		if (!roleSet.has(req.user.userRole)) {
			throw Error("unauthorized");
		}
		next();
	};
};
