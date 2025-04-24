import { In, MongoRepository, Repository } from "typeorm";
import { SurgeryLog } from "../entity/mongodb/SurgeryLog.js";
import { SurgeryInterface } from "../utils/dataTypes.js";
import { Surgery } from "../entity/sql/Surgery.js";
import { Rating } from "../entity/mongodb/Rating.js";
import { User } from "../entity/sql/User.js";

export class FormatService {
	constructor(
		private surgeryRepo: Repository<Surgery>,
		private userRepo: Repository<User>,
		private ratingRepo: MongoRepository<Rating>
	) {}
	async formatSurgeries(surgeries: SurgeryLog[]): Promise<SurgeryInterface[]> {
		const names = await Promise.all(
			surgeries.map(async (sur) => {
				const surgeriesName = await this.surgeryRepo.findOne({
					where: {
						id: sur.surgeryId,
					},
					select: ["id", "name"],
				});
				return surgeriesName.name;
			})
		);

		const ratings = await Promise.all(
			surgeries.map(async (sur) => {
				const rating = await this.ratingRepo.find({
					where: {
						surgeryId: { $eq: sur.surgeryId },
					},
				});

				return rating;
			})
		);

		const formatedRating = await Promise.all(
			ratings.map(async (rating) => {
				if (rating.length > 0) {
					const { average } = await this.formatRatings(rating);
					return average;
				}
				return null;
			})
		);
		return surgeries.map((surgery, index) => ({
			id: surgery.surgeryId,
			name: names[index],
			date: surgery.date,
			time: surgery.time,
			status: surgery.status,
			stars: formatedRating[index] ? formatedRating[index] : 0,
			icdCode: surgery.icdCode,
			cptCode: surgery.cptCode,
		}));
	}

	async formatRatings(ratings: Rating[]) {
		if (!Array.isArray(ratings) || ratings.length === 0) return null;

		const userIds = [...new Set(ratings.map((r) => r.userId))];

		const users = await this.userRepo.find({
			where: { id: In(userIds) },
			select: ["id", "first_name", "last_name", "picture"],
		});

		const userMap = users.reduce((acc, user) => {
			acc[user.id] = {
				id: user.id,
				name: `Dr. ${user.first_name} ${user.last_name}`,
				picture: user.picture,
			};
			return acc;
		}, {});

		const average =
			ratings.reduce((sum, r) => sum + (r.stars || 0), 0) / ratings.length;

		const breakdown = ratings.map((r) => ({
			id: r.id,
			stars: r.stars,
			user: userMap[r.userId] || null,
			comment: r.comment?.trim() || null,
			createdAt: r.createdAt,
		}));

		return {
			average: Math.round(average * 10) / 10,
			count: ratings.length,
			breakdown,
		};
	}

	formatUserData(user: User) {
		return {
			id: user.id,
			name: `${user.first_name} ${user.last_name}`,
			email: user.email,
			phone: user.phone_number,
			picture: user.picture,
			userRole: user.role.name,
			permissions: user.role.permissions.map((perm) => perm.action),
			department: {
				id: user.department.id,
				name: user.department.name,
			},
			affiliation: {
				id: user.affiliation.id,
				name: user.affiliation.name,
			},
		};
	}
}
