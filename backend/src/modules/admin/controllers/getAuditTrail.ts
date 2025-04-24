import { Request, Response } from "express";
import { auditTrailRepo } from "../../../config/repositories.js";

const ALLOWED_ACTIONS = [
	"Login",
	"Signup",
	"Verify",
	"INSERT",
	"UPDATE",
	"DELETE",
	"Daily cleanup",
];

const DEFAULT_LIMIT = 25;
const DEFAULT_PAGE = 1;

interface AuditQueryParams {
	action?: string;
	startDate?: Date;
	endDate?: Date;
	page?: number;
}

export const getAuditTrail = async (req: Request, res: Response) => {
	const { action, startDate, endDate, page } = req.query as AuditQueryParams;

	if (!action || !ALLOWED_ACTIONS.includes(action.toString())) {
		throw Error(
			`Invalid format. Allowed values are ${ALLOWED_ACTIONS.join(", ")}`
		);
	}

	const query: Record<string, any> = { action };
	if (startDate && endDate) {
		const start = new Date(startDate.toString());
		const end = new Date(endDate.toString());

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			throw Error("Invalid date format for startDate or endDate.");
		}

		if (start && end && start > end) {
			res.status(400).json({
				success: false,
				message: "Start date must be before end date",
			});
			return;
		}

		query.timestamp = { $gte: start, $lte: end };
	}

	const parsedPage = Math.max(DEFAULT_PAGE, Number(page) || DEFAULT_PAGE);
	const skip = (parsedPage - 1) * DEFAULT_LIMIT;

	const [results, total] = await auditTrailRepo.findAndCount({
		where: query,
		order: { timestamp: "DESC" },
		skip,
		take: DEFAULT_LIMIT,
	});

	res.status(200).json({
		success: true,
		results,
		pagination: {
			total,
			page: parsedPage,
			limit: DEFAULT_LIMIT,
			totalPages: Math.ceil(total / DEFAULT_LIMIT),
		},
	});
};
