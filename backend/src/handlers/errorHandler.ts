import { NextFunction, Response, Request, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import logger from "../config/loggerConfig.js";

export const errorHandler: ErrorRequestHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	console.error(err);

	const errorMessage = err.message;
	const errorMessageLower = errorMessage.toLowerCase();
	let statusCode = 500;
	let message = "Something went wrong";
	let details: any = undefined;

	switch (true) {
		case err instanceof ZodError: {
			statusCode = 400;
			message = errorMessage;
			break;
		}

		case errorMessage.includes(" - "): {
			statusCode = 400;
			message = errorMessage;
			break;
		}

		case ["access denied", "unauthorized"].includes(errorMessageLower): {
			statusCode = 401;
			message = errorMessage;
			break;
		}

		case errorMessageLower.includes("validation error"):
		case errorMessageLower.includes("invalid"):
		case errorMessageLower.includes("- required"):
		case errorMessage === "Only image files are allowed": {
			statusCode = 400;
			message = errorMessage;
			break;
		}

		case err.name === "QueryFailedError": {
			statusCode = 500;
			message = "Database query error";
			details = errorMessage;
			break;
		}

		case err.name === "EntityNotFoundError": {
			statusCode = 404;
			message = "Requested resource not found";
			break;
		}
		case errorMessageLower.includes("not") &&
			errorMessageLower.includes("found"): {
			statusCode = 404;
			message = errorMessage;
			break;
		}

		case errorMessageLower.includes("already exists"): {
			statusCode = 409;
			message = errorMessage;
			break;
		}

		case errorMessage === "Internal server error": {
			statusCode = 500;
			message = errorMessage;
			break;
		}
	}

	sendErrorResponse(res, statusCode, message, details);
};

const sendErrorResponse = (
	res: Response,
	statusCode: number,
	message: string,
	details?: any
) => {
	logger.error(message + " " + details);
	res.status(statusCode).json({
		success: false,
		message,
		details,
	});
};
