import bcrypt from "bcrypt";

interface CreateOTPReturn {
	otp: string;
	hashedOtp: string;
}

export const createOtp = async (
	saltRounds: number
): Promise<CreateOTPReturn> => {
	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const secret_otp = await bcrypt.hash(otp, saltRounds);

	return {
		otp,
		hashedOtp: secret_otp,
	};
};
