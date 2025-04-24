import bcrypt from "bcrypt";
import crypto from "crypto";

export class HashFunctions {
	private saltRounds: number;
	private hashedText?: string | null;

	constructor(hashedText?: string) {
		this.hashedText = hashedText;
		this.saltRounds = parseInt(process.env.salt_rounds);
	}

	async bcryptHash(text: string): Promise<string> {
		const hashedText = await bcrypt.hash(text, this.saltRounds);
		return hashedText;
	}

	async compareBcryptHash(text: string): Promise<boolean> {
		const isMatched = await bcrypt.compare(text, this.hashedText);
		return isMatched;
	}

	async generateResetToken(): Promise<{
		token: string;
		hashedToken: string;
	}> {
		const token = crypto.randomBytes(32).toString("hex");
		const hashedToken = await bcrypt.hash(
			token,
			this.saltRounds
		);
		return { token, hashedToken };
	}
}
