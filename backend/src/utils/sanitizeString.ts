export const sanitizeString = (input: string): string => {
	return input
		.trim()
		.replace(/\s+/g, " ")
		.replace(/[<>$%&\\/\\^|#]/g, "") // More characters
		.replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
};
