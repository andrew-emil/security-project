import { Repository } from "typeorm";
import { RefreshToken } from "../entity/sql/refreshToken.js";
import jwt from "jsonwebtoken";
import { HashFunctions } from "../utils/hashFunction.js";
import { User } from "../entity/sql/User.js";
import { JWTPayload } from "../utils/dataTypes.js";

export class AuthService {
	constructor(private tokenRepo: Repository<RefreshToken>) {}

	private accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
	private refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
	private hashFunction = new HashFunctions();

	generateToken(userId: string, role: string) {
		const payload: JWTPayload = {
			id: userId,
			userRole: role,
		};

		const accessToken = jwt.sign(payload, this.accessTokenSecret, {
			expiresIn: "15s",
		});

		const refreshToken = jwt.sign(payload, this.refreshTokenSecret, {
			expiresIn: "60d",
		});

		return { accessToken, refreshToken };
	}

	async storeRefreshToken(user: User, token: string) {
		await this.tokenRepo.delete({ user: { id: user.id } });

		const expireDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
		const hashedToken = await this.hashFunction.bcryptHash(token);

		const refreshToken = this.tokenRepo.create({
			token: hashedToken,
			user,
			expiresAt: expireDate,
		});

		await this.tokenRepo.save(refreshToken);
	}

	async refreshTokens(user: User, oldRefreshToken: string) {
		const existingToken = await this.tokenRepo.findOne({
			where: { user: { id: user.id } },
			relations: ["user"],
		});

		if (
			!existingToken ||
			!(await existingToken.compareToken(oldRefreshToken))
		) {
			throw new Error("Invalid refresh token");
		}

		if (existingToken.expiresAt < new Date()) {
			await this.tokenRepo.remove(existingToken);
			throw new Error("Expired refresh token");
		}

		const newTokens = this.generateToken(user.id, user.role.name);

		await this.tokenRepo.remove(existingToken);
		await this.storeRefreshToken(user, newTokens.refreshToken);

		return newTokens;
	}

	async revokeTokens(userId: string) {
		await this.tokenRepo.delete({ user: { id: userId } });
	}

	async validateRefreshToken(userId: string, token: string): Promise<boolean> {
		const storedToken = await this.tokenRepo.findOne({
			where: { user: { id: userId } },
			relations: ["user"],
		});

		return !!storedToken && storedToken.compareToken(token);
	}
}
