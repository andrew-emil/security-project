import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { MongoDataSource } from "../../../config/data-source.js";
import { Rating } from "../../../entity/mongodb/Rating.js";
import { userRepo } from "../../../config/repositories.js";

export const updateRating = async (req: Request, res: Response) => {
	const id = req.params.id;

	if (!id) throw Error("Invalid Id format");
	const formatedID = new ObjectId(id);

	const { stars, comment } = req.body;
	if (!stars && !comment) throw Error("Invalid credentails");

	const userId = req.user?.id;
	if (!userId) throw Error("Unauthorized");

	const user = await userRepo.findOne({ where: { id: userId } });
	if (!user) throw new Error("User not found");

	let formatNewRating: any;
	await MongoDataSource.transaction(async (manager) => {
		const rating = await manager.findOne(Rating, {
			where: { _id: formatedID } as any,
		});
		if (!rating) throw Error("Rating not found");
		if (user.id !== rating.userId) throw Error("Unauthorized");

		rating.stars = stars ? stars : rating.stars;
		rating.comment = comment ? comment.trim() : rating.comment;
		rating.createdAt = new Date();

		const updatedRating = await manager.save(Rating, rating);

		formatNewRating = {
			id: updatedRating.id,
			stars: updatedRating.stars,
			comment: updatedRating.comment,
			createdAt: updatedRating.createdAt,
			user: {
				id: user.id,
				name: `Dr. ${user.first_name} ${user.last_name}`,
				picture: user.picture,
			},
		};
	});

	res.status(202).json({
		success: true,
		message: "Rating updated successfully",
		updateRating: formatNewRating,
	});
};
