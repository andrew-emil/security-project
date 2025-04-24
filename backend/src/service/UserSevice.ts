import { createOtp } from "../utils/createOTP.js";
import { User } from "../entity/sql/User.js";
import { HashFunctions } from "../utils/hashFunction.js";
import { Repository } from "typeorm";
import { USER_STATUS } from "../utils/dataTypes.js";

export class UserService {
	private MAX_FAILED_ATTEMPTS = 5;
	private LOCK_TIME_MINUTES = 60;

	constructor(private userRepo: Repository<User>) {}

	async login(
		email: string,
		password: string
	): Promise<{ success: boolean; user?: User; message?: string }> {
		const user = await this.userRepo.findOneBy({
			email,
			account_status: USER_STATUS.ACTIVE,
		});

		if (!user) return { success: false, message: "Invalid credentials" };

		if (user.lock_until && new Date(user.lock_until) > new Date()) {
			return {
				success: false,
				message: `Account locked. Try again after ${new Date(
					user.lock_until
				).toLocaleTimeString()}.`,
			};
		}

		const hashFunction = new HashFunctions(user.password_hash);

		const isMatched = await hashFunction.compareBcryptHash(password);
		if (!isMatched) {
			user.failed_attempts += 1;
			if (user.failed_attempts >= this.MAX_FAILED_ATTEMPTS) {
				user.lock_until = new Date(
					Date.now() + this.LOCK_TIME_MINUTES * 60 * 1000
				);
			}
			await this.userRepo.save(user);
			return { success: false, message: "Invalid credentials" };
		}

		user.failed_attempts = 0;
		user.lock_until = null;
		await this.userRepo.save(user);

		return { success: true, user };
	}

	async sendOtp(user: User): Promise<{ success: boolean; message: string }> {
		const { otp, hashedOtp } = await createOtp(
			parseInt(process.env.salt_rounds) || 10
		);
		console.log("Generated OTP:", otp);

		user.otp_secret = hashedOtp;

		await this.userRepo.save(user);

		return {
			success: true,
			message: "OTP sent. Please verify to complete login.",
		};
	}

	async forgetPassword(email: string): Promise<void> {
		const user = await this.userRepo.findOneBy({ email });
		if (!user) return;

		const hashFunction = new HashFunctions();

		const { token, hashedToken } = await hashFunction.generateResetToken();
		const todaysDate = Date.now();
		const expiryDate = todaysDate + 60 * 60 * 1000;

		user.reset_token = hashedToken;
		user.reset_token_expires = new Date(expiryDate);
		await this.userRepo.save(user);

		return;
	}

	async resetPassword(
		email: string,
		token: string,
		newPassword: string
	): Promise<{ success: boolean; message?: string }> {
		const user = await this.userRepo.findOne({
			where: { email },
		});

		if (
			!user ||
			!user.reset_token_expires ||
			Date.now() > new Date(user.reset_token_expires).getTime()
		) {
			return { success: false, message: "Invalid or expired token." };
		}
		const hashFunction = new HashFunctions(user.reset_token);
		const isMatched = hashFunction.compareBcryptHash(token);

		if (!isMatched)
			return { success: false, message: "Invalid or expired token." };

		const hashedPassword = await hashFunction.bcryptHash(newPassword);

		user.password_hash = hashedPassword;
		user.reset_token = null;
		user.reset_token_expires = null;
		await this.userRepo.save(user);

		return { success: true, message: "Password reset successful" };
	}

	async verify2FA(email: string, otp: string) {
		const user = await this.userRepo.findOne({
			where: { email },
			relations: ["role", "role.permissions", "affiliation", "department"],
		});
		if (!user) {
			return { success: false, message: "User Not Found" };
		}

		if (user.lock_until && new Date(user.lock_until) > new Date()) {
			return {
				success: false,
				message: `Account locked. Try again after ${new Date(
					user.lock_until
				).toLocaleTimeString()}.`,
			};
		}

		const hashFunctions = new HashFunctions(user.otp_secret);

		const isOtpValid = await hashFunctions.compareBcryptHash(otp);
		if (!isOtpValid) {
			user.failed_attempts += 1;

			if (user.failed_attempts >= this.MAX_FAILED_ATTEMPTS) {
				user.lock_until = new Date(
					Date.now() + this.LOCK_TIME_MINUTES * 60 * 1000
				);
			}

			await this.userRepo.save(user);
			return { success: false, message: "Invalid credentials" };
		}

		user.failed_attempts = 0;
		user.lock_until = null;
		user.otp_secret = null;
		user.last_login = new Date();
		const newUser = await this.userRepo.save(user);

		return { success: true, newUser };
	}
}
