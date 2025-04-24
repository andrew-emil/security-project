import { Request, Response } from "express";
import { surgeryLogsRepo, userRepo } from "../../../config/repositories.js";

export const getPerformance = async (req: Request, res: Response) => {
	const { affiliationId } = req.params;

	if (!affiliationId) throw Error("Invalid credentials");

	try {
		const qb = userRepo
			.createQueryBuilder("user")
			.leftJoin("user.progress", "progress")
			.leftJoin("user.affiliation", "affiliation")
			.select([
				"user.id AS userId",
				"CONCAT(user.first_name, ' ', user.last_name) AS doctorName",
				"AVG(progress.completedCount) AS avg_surgeries",
			])
			.where("affiliation.id = :affiliationId", { affiliationId })
			.groupBy("user.id");

		const teams = await qb.getRawMany();

		const userIds = teams.map((team) => team.userId);

		if (userIds.length === 0) {
			res.status(200).json({ success: true, teams: [] });
			return;
		}

		const pipeline = [
			{
				$match: {
					$or: [
						{ leadSurgeon: { $in: userIds } },
						{ "doctorsTeam.doctorId": { $in: userIds } },
					],
				},
			},
			{
				$lookup: {
					from: "rating",
					localField: "surgeryId",
					foreignField: "surgeryId",
					as: "ratings",
				},
			},
			{ $unwind: "$ratings" },
			{
				$project: {
					involvedUsers: {
						$concatArrays: [["$leadSurgeon"], "$doctorsTeam.doctorId"],
					},
					stars: "$ratings.stars",
				},
			},
			{ $unwind: "$involvedUsers" },
			{
				$group: {
					_id: "$involvedUsers",
					avgRating: { $avg: "$stars" },
				},
			},
		];

		const avgRatings: any[] = await surgeryLogsRepo
			.aggregate(pipeline)
			.toArray();

		const ratingMap = new Map();
		avgRatings.forEach((rating) => {
			ratingMap.set(rating._id, rating.avgRating);
		});

		const teamsWithRatings = teams.map((team) => ({
			doctorName: team.doctorName,
			avg_surgeries: parseFloat(team.avg_surgeries) || 0,
			avg_rating: ratingMap.get(team.userId)?.toFixed(2) || 0,
		}));

		res.status(200).json({
			success: true,
			teams: teamsWithRatings,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
