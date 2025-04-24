import { Request, Response } from "express";
import { addRatingSchema } from "../../../utils/zodSchemas.js";
import { formatErrorMessage } from "../../../utils/formatErrorMessage.js";
import {
	ratingRepo,
	surgeryLogsRepo,
	userRepo,
} from "../../../config/repositories.js";

export const addRating = async (req: Request, res: Response) => {
	const userId = req.user?.id;
	if (!userId) throw Error("Unauthorized");

	const validation = addRatingSchema.safeParse(req.body);
	if (!validation.success)
		throw Error(formatErrorMessage(validation), { cause: validation.error });

	const { surgeryId, stars, comment } = validation.data;

	const [user, surgeryLog] = await Promise.all([
		userRepo.findOne({
			where: { id: userId },
			select: ["id", "first_name", "last_name", "picture"],
		}),
		surgeryLogsRepo.findOne({
			where: {
				surgeryId,
			},
		}),
	]);

	if (!user) throw new Error("User not found");
	if (!surgeryLog) throw Error("Surgery records not found");

	const isAuthorized =
		surgeryLog.leadSurgeon === userId ||
		surgeryLog.doctorsTeam.some((doctor) => doctor.doctorId === userId);

	if (!isAuthorized) throw Error("Unauthorized");

	const rating = ratingRepo.create({
		surgeryId,
		userId,
		stars,
		comment,
	});
	const newRating = await ratingRepo.save(rating);

	const formatNewRating = {
		id: newRating.id,
		stars: newRating.stars,
		comment: newRating.comment,
		createdAt: newRating.createdAt,
		user: {
			id: user.id,
			name: `Dr. ${user.first_name} ${user.last_name}`,
			picture: user.picture,
		},
	};

	res.status(201).json({
		success: true,
		message: "Rating added successfully",
		data: formatNewRating,
	});
};
