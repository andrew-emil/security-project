import { MongoRepository, Repository } from "typeorm";
import { User } from "../entity/sql/User.js";
import { SurgeryLog } from "../entity/mongodb/SurgeryLog.js";
import { STATUS, USER_STATUS } from "../utils/dataTypes.js";
import { Affiliations } from "../entity/sql/Affiliations.js";

interface AvailabilityEvent {
	date: string;
	time: string;
	available: boolean;
	color: string;
}

interface StaffRecommendation {
	[expertise: string]: Array<{
		id: string;
		firstName: string;
		lastName: string;
	}>;
}

interface DoctorConflict {
	doctorId: string;
	doctorName: string;
	conflicts: Array<{
		surgeryId: number;
		date: Date;
		time: string;
		status: string;
	}>;
}

export class ScheduleService {
	constructor(
		private userRepo: Repository<User>,
		private surgeryLogRepo: MongoRepository<SurgeryLog>
	) {}

	private getDateRange() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const sevenDaysLater = new Date(today);
		sevenDaysLater.setDate(today.getDate() + 7);
		sevenDaysLater.setHours(23, 59, 59, 999);

		return { start: today, end: sevenDaysLater };
	}

	async getUserAvailabilityCalendar(
		userId: string
	): Promise<AvailabilityEvent[]> {
		const { start, end } = this.getDateRange();

		const surgeries = await this.surgeryLogRepo.find({
			where: {
				date: { $gte: start, $lte: end },
				$or: [{ "doctorsTeam.doctorId": userId }, { leadSurgeon: userId }],
			},
			select: ["date", "time", "doctorsTeam", "slots", "esitmatedEndTime"],
			order: {
				date: "ASC",
				time: "ASC",
			},
		});

		const groupedResults = this.groupEventsByDay(surgeries, start, end);
		return groupedResults;
	}

	async recommendStaff(
		affiliation: Affiliations,
		date: Date,
		time: string
	): Promise<StaffRecommendation> {
		const ongoingSurgeries = await this.surgeryLogRepo.find({
			where: {
				status: { $eq: STATUS.ONGOING },
				date,
				time,
			},
			select: {
				leadSurgeon: true,
				doctorsTeam: true,
			},
		});

		const filteredUsers = new Set<string>();
		ongoingSurgeries.forEach((surgery) => {
			if (surgery.leadSurgeon) filteredUsers.add(surgery.leadSurgeon);
			surgery.doctorsTeam?.forEach((doctor) => {
				if (doctor.doctorId) filteredUsers.add(doctor.doctorId);
			});
		});

		const createBaseQB = () => {
			const qb = this.userRepo
				.createQueryBuilder("user")
				.leftJoin("user.progress", "progress")
				.leftJoin("user.affiliation", "affiliation")
				.leftJoin("user.role", "role")
				.where("user.account_status = :active", { active: USER_STATUS.ACTIVE })
				.andWhere("role.name != :adminRole", { adminRole: "Admin" })
				.orderBy("COALESCE(progress.completedCount, 0)", "DESC")
				.select([
					"user.id",
					"user.first_name",
					"user.last_name",
					"user.picture",
					"role.name",
				]);

			if (filteredUsers.size > 0) {
				qb.andWhere("user.id NOT IN (:...filteredUsers)", {
					filteredUsers: Array.from(filteredUsers),
				});
			}

			return qb;
		};

		const [relatedUsers, otherUsers] = await Promise.all([
			createBaseQB()
				.andWhere("affiliation.id = :affiliationId", {
					affiliationId: affiliation.id,
				})
				.getMany(),
			createBaseQB()
				.andWhere("affiliation.id != :affiliationId", {
					affiliationId: affiliation.id,
				})
				.getMany(),
		]);

		// Build recommendation with conflict status
		const staffRecommendation = this.addUsersToRecommendation(
			relatedUsers,
			otherUsers
		);

		return staffRecommendation;
	}

	async getConflictResolutionData(): Promise<DoctorConflict[]> {
		const surgeries = await this.surgeryLogRepo.find({
			where: { status: STATUS.ONGOING },
			select: [
				"surgeryId",
				"doctorsTeam",
				"date",
				"time",
				"status",
				"leadSurgeon",
			],
			relations: ["doctorsTeam"],
		});

		const doctorMap = this.getDoctorMap(surgeries);
		const filteredDoctors = this.filterDoctorsMap(doctorMap);
		const doctorsNames = await this.getDoctorsName(filteredDoctors);
		return doctorsNames;
	}

	private groupEventsByDay(
		surgeries: SurgeryLog[],
		current: Date,
		end: Date
	): AvailabilityEvent[] {
		const events: AvailabilityEvent[] = [];
		let surgeryIndex = 0;

		while (current <= end) {
			const dayStr = current.toISOString().split("T")[0];

			const daySurgeries: SurgeryLog[] = [];
			while (
				surgeryIndex < surgeries.length &&
				new Date(surgeries[surgeryIndex].date).toISOString().split("T")[0] ===
					dayStr
			) {
				daySurgeries.push(surgeries[surgeryIndex]);
				surgeryIndex++;
			}

			if (daySurgeries.length === 0) {
				events.push({
					date: dayStr,
					time: "00:00 - 24:00",
					color: "green",
					available: true,
				});
			} else {
				if (daySurgeries[0].time !== "00:00") {
					events.push({
						date: dayStr,
						time: `00:00 - ${daySurgeries[0].time}`,
						color: "green",
						available: true,
					});
				}

				for (let i = 0; i < daySurgeries.length; i++) {
					const surgery = daySurgeries[i];

					events.push({
						date: dayStr,
						time: `${surgery.time} - ${surgery.esitmatedEndTime}`,
						color: "red",
						available: false,
					});

					// If there is a next surgery, and if there's a gap between the current surgery's estimated end time and the next surgery's start.
					if (i < daySurgeries.length - 1) {
						const nextSurgery = daySurgeries[i + 1];
						if (surgery.esitmatedEndTime < nextSurgery.time) {
							events.push({
								date: dayStr,
								time: `${surgery.esitmatedEndTime} - ${nextSurgery.time}`,
								color: "green",
								available: true,
							});
						}
					} else {
						// For the last surgery, if it doesn't end at the end of the day, add available period until day end.
						if (
							surgery.esitmatedEndTime !== "24:00" &&
							surgery.esitmatedEndTime !== "23:59"
						) {
							events.push({
								date: dayStr,
								time: `${surgery.esitmatedEndTime} - 24:00`,
								color: "green",
								available: true,
							});
						}
					}
				}
			}

			current.setDate(current.getDate() + 1);
		}

		return events;
	}

	private addUsersToRecommendation(
		relatedUsers: User[],
		otherUsers?: User[]
	): StaffRecommendation {
		const staffRecommendation: StaffRecommendation = {};
		const allUsers = [...relatedUsers, ...(otherUsers || [])];

		allUsers.forEach((user) => {
			const roleName = user.role?.name || "Unassigned";

			if (!staffRecommendation[roleName]) {
				staffRecommendation[roleName] = [];
			}

			staffRecommendation[roleName].push({
				id: user.id,
				firstName: user.first_name,
				lastName: user.last_name,
			});
		});

		return staffRecommendation;
	}

	private getDoctorMap(surgeries: SurgeryLog[]): Map<string, DoctorConflict> {
		const doctorMap = new Map<string, DoctorConflict>();

		surgeries.forEach((surgery) => {
			const conflictDetail = {
				surgeryId: surgery.surgeryId,
				date: surgery.date,
				time: surgery.time,
				status: surgery.status,
			};

			if (surgery.doctorsTeam) {
				surgery.doctorsTeam.forEach((doctor) => {
					if (!doctor.doctorId) return;

					const existingEntry = doctorMap.get(doctor.doctorId) || {
						doctorId: doctor.doctorId,
						doctorName: "",
						conflicts: [] as DoctorConflict["conflicts"],
					};

					existingEntry.conflicts.push(conflictDetail);
					doctorMap.set(doctor.doctorId, existingEntry);
				});
			}

			if (surgery.leadSurgeon) {
				const leadId = surgery.leadSurgeon;

				const existingEntry = doctorMap.get(leadId) || {
					doctorId: leadId,
					doctorName: "",
					conflicts: [] as DoctorConflict["conflicts"],
				};

				existingEntry.conflicts.push(conflictDetail);
				doctorMap.set(leadId, existingEntry);
			}
		});

		return doctorMap;
	}

	private filterDoctorsMap(
		doctorMap: Map<string, DoctorConflict>
	): DoctorConflict[] {
		const filteredDoctorsMap = Array.from(doctorMap.values())
			.filter((entry) => entry.conflicts.length > 1)
			.map((entry) => ({
				...entry,
				conflicts: entry.conflicts.sort((a, b) => {
					const dateTimeA = new Date(`${a.date.toISOString()} ${a.time}`);
					const dateTimeB = new Date(`${b.date.toISOString()} ${b.time}`);
					return dateTimeA.getTime() - dateTimeB.getTime();
				}),
			}));

		return filteredDoctorsMap;
	}

	private async getDoctorsName(doctorConflicts: DoctorConflict[]) {
		return Promise.all(
			doctorConflicts.map(async (entry) => {
				const doctorId = entry.doctorId;
				const doctor = await this.userRepo.findOne({
					where: { id: doctorId },
					select: ["first_name", "last_name"],
				});
				const doctorName = doctor
					? `Dr. ${doctor.first_name} ${doctor.last_name}`
					: "";
				return {
					...entry,
					doctorName,
				};
			})
		);
	}
}
