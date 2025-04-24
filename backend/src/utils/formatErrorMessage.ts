import { SafeParseReturnType } from "zod";

export const formatErrorMessage = (
	errors: SafeParseReturnType<any, any>
): string => {
	const errorMessages = errors.error.issues
		.map((issue) => `${issue.path.join(".")} - ${issue.message}`)
		.join(", ");

	return errorMessages;
};
