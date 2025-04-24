import { Repository, MongoRepository, QueryRunner } from "typeorm";
import { RequirementProgress, SURGERY_TYPE } from "../utils/dataTypes.js";
import { User } from "../entity/sql/User.js";
import { Role } from "../entity/sql/Roles.js";
import { SurgeryLog } from "../entity/mongodb/SurgeryLog.js";
import { EligibilityResult, TrainingProgress } from "../utils/dataTypes.js";
import { ProcedureType } from "../entity/sql/ProcedureType.js";
import { userProgressRepo } from "../config/repositories.js";
import { Surgery } from "../entity/sql/Surgery.js";
import { Requirement } from "../entity/sql/Requirments.js";
import { UserProgress } from "../entity/sql/UserProgress.js";
import { AppDataSource } from "../config/data-source.js";
import logger from "../config/loggerConfig.js";

export class TrainingService {
	constructor(
		private userRepo: Repository<User>,
		private roleRepo: Repository<Role>,
		private surgeryLogRepo: MongoRepository<SurgeryLog>
	) {}

	async getTrainingProgress(userId: string): Promise<TrainingProgress> {
		const user = await this.userRepo.findOne({
			where: { id: userId },
			relations: {
				role: {
					requirements: {
						procedure: true,
					},
				},
			},
		});

		if (!user?.role) {
			throw new Error("User or role not found");
		}

		// Handle roles with no requirements
		if (!user.role.requirements?.length) {
			return {
				overallStatus: "Fully Qualified",
				requirements: [],
				totalCompleted: 0,
				totalRequired: 0,
				completionPercentage: 100,
			};
		}

		// Get progress for each requirement
		const requirementsProgress = await Promise.all(
			user.role.requirements.map(async (requirement) => {
				const completed = await this.surgeryLogRepo.count({
					where: {
						"procedure.id": requirement.procedure.id,
						trainingCredits: {
							$elemMatch: {
								userId: userId,
								roleId: user.role.id,
								verified: true,
							},
						},
					},
				});

				return {
					procedureId: requirement.procedure.id,
					procedureName: requirement.procedure.name,
					category: requirement.procedure.category,
					required: requirement.requiredCount,
					completed: completed,
					remaining: Math.max(requirement.requiredCount - completed, 0),
					met: completed >= requirement.requiredCount,
				};
			})
		);

		// Calculate totals
		const totalRequired = requirementsProgress.reduce(
			(sum, r) => sum + r.required,
			0
		);
		const totalCompleted = requirementsProgress.reduce(
			(sum, r) => sum + r.completed,
			0
		);
		const completionPercentage =
			totalRequired > 0
				? Math.round((totalCompleted / totalRequired) * 100)
				: 100;

		// Determine overall status
		const overallStatus = requirementsProgress.every((r) => r.met)
			? "Fully Qualified"
			: requirementsProgress.some((r) => r.met)
			? "Partially Qualified"
			: "Not Qualified";

		return {
			overallStatus,
			requirements: requirementsProgress,
			totalCompleted,
			totalRequired,
			completionPercentage,
		};
	}

	async recordSurgeryCredit(
		userId: string,
		surgeryId: number,
		roleId: number
	): Promise<void> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const surgery = await queryRunner.manager.findOne(Surgery, {
				where: { id: surgeryId },
				relations: ["procedure"],
				lock: { mode: "pessimistic_write" },
			});

			if (!surgery?.procedure) {
				throw Error(`Surgery ${surgeryId} has no associated procedure type`);
			}

			// 2. Verify procedure-role compatibility
			const requirement = await queryRunner.manager.findOne(Requirement, {
				where: {
					role: { id: roleId },
					procedure: { id: surgery.procedure.id },
				},
			});

			if (!requirement) {
				throw Error(
					`Role ${roleId} not authorized for ${surgery.procedure.name}`
				);
			}

			// 3. Update user progress atomically
			await queryRunner.manager
				.createQueryBuilder()
				.insert()
				.into(UserProgress)
				.values({
					user: { id: userId },
					procedure: { id: surgery.procedure.id },
					completedCount: 1,
				})
				.orUpdate(
					["completed_count", "last_performed"],
					["user_id", "procedure_id"],
					{
						skipUpdateIfNoValuesChanged: true,
					}
				)
				.execute();

			// 4. Increment completed count safely
			await queryRunner.manager.increment(
				UserProgress,
				{
					user: { id: userId },
					procedure: { id: surgery.procedure.id },
				},
				"completedCount",
				1
			);
		} catch (error) {
			console.error(`Credit recording failed for user ${userId}:`, error);
			throw Error(`Failed to record surgical credit: ${error.message}`);
		}
	}

	async checkEligibility(
		userId: string,
		targetRoleId: number
	): Promise<EligibilityResult> {
		const [currentRole, targetRole] = await Promise.all([
			this.roleRepo.findOne({
				where: { users: { id: userId } },
				relations: ["parent"],
			}),
			this.roleRepo.findOne({
				where: { id: targetRoleId },
				relations: ["requirements", "requirements.procedure.category"],
			}),
		]);

		if (!currentRole || !targetRole) {
			throw new Error("Role records not found");
		}

		// Validate role hierarchy using parent relationships
		let isValidHierarchy = false;
		let parentCheck = currentRole.parent;

		while (parentCheck) {
			if (parentCheck.id === targetRole.id) {
				isValidHierarchy = true;
				break;
			}
			parentCheck = parentCheck.parent;
		}

		if (!isValidHierarchy) {
			return {
				...this.emptyProgressResponse(),
				eligible: false,
				reason: `Role progression violation: ${targetRole.name} is not a valid successor of ${currentRole.name}`,
			};
		}

		// Handle roles with no requirements
		if (!targetRole.requirements?.length) {
			return {
				...this.emptyProgressResponse(),
				eligible: true,
				reason: "Target role has no training requirements",
			};
		}

		// Get detailed progress against target requirements
		const progress = await this.getTrainingProgress(userId);
		const targetRequirements = new Map(
			targetRole.requirements.map((req) => [
				req.procedure.id,
				{ required: req.requiredCount, category: req.procedure.category },
			])
		);

		const unmetRequirements = progress.requirements.filter((p) => {
			const req = targetRequirements.get(p.procedureId);
			return req && p.completed < req.required;
		});

		const eligible = unmetRequirements.length === 0;

		return {
			...progress,
			eligible,
			reason: eligible ? "" : this.formatUnmetRequirements(unmetRequirements),
		};
	}

	async handleSurgeryCompletion(surgeryId: number): Promise<void> {
		try {
			const surgery = await this.surgeryLogRepo.findOne({
				where: { surgeryId: { $eq: surgeryId } },
			});

			if (!surgery?.trainingCredits?.length) {
				console.warn(`No training credits found for surgery: ${surgeryId}`);
				return;
			}

			await Promise.all(
				surgery.trainingCredits.map(async (credit) => {
					try {
						if (credit.verified) {
							await this.recordSurgeryCredit(
								credit.userId,
								surgeryId,
								credit.roleId
							);
						}
					} catch (creditError) {
						console.error(
							`Failed to record credit for user ${credit.userId}:`,
							creditError
						);
					}
				})
			);
		} catch (error) {
			console.error(
				`Failed to process training credits for surgery ${surgeryId}:`,
				error
			);
			throw new Error("Failed to update training records");
		}
	}

	async getRequiredSurgeries(role: Role): Promise<
		Array<{
			category: SURGERY_TYPE;
			count: number;
		}>
	> {
		if (!role.requirements?.length) {
			return [];
		}

		// Group requirements by category
		const categoryRequirements = role.requirements.reduce(
			(acc, requirement) => {
				const category = requirement.procedure.category;
				acc[category] = (acc[category] || 0) + requirement.requiredCount;
				return acc;
			},
			{} as Record<SURGERY_TYPE, number>
		);

		return Object.entries(categoryRequirements).map(([category, count]) => ({
			category: category as SURGERY_TYPE,
			count,
		}));
	}

	async initializeSurgeryRecords(
		participants: Array<{ userId: string; roleId: number }>,
		leadSurgeonId: string
	) {
		const trainingCredits = participants.map((p) => ({
			userId: p.userId,
			roleId: p.roleId,
			verified: true,
			verifiedBy: leadSurgeonId,
			verifiedAt: new Date(),
		}));

		return trainingCredits;
	}

	async removeSurgeryRecords(surgeryId: number) {
		await this.surgeryLogRepo.updateMany(
			{ surgeryId },
			{ $set: { trainingCredits: [] } }
		);
	}

	async adjustProgress(
		queryRunner: QueryRunner,
		userIds: string[],
		procedureType: ProcedureType,
		delta: number
	) {
		for (const userId of userIds) {
			const progress = await userProgressRepo.findOne({
				where: {
					user: { id: userId },
					procedure: { id: procedureType.id },
				},
			});

			if (progress) {
				const newCount = Math.max(0, progress.completedCount + delta);
				if (newCount !== progress.completedCount) {
					progress.completedCount = newCount;
					await queryRunner.manager.save(progress);
				}
			}
		}
	}

	private emptyProgressResponse(): TrainingProgress {
		return {
			overallStatus: "Fully Qualified",
			requirements: [],
			totalCompleted: 0,
			totalRequired: 0,
			completionPercentage: 100,
		};
	}

	private formatUnmetRequirements(unmet: RequirementProgress[]): string {
		return unmet
			.map(
				(req) =>
					`${req.remaining} more ${req.category} procedures needed for ${req.procedureName}`
			)
			.join(", ");
	}

	// Add to TrainingService class
	async revertSurgeryCompletion(surgeryId: number): Promise<void> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// 1. Get surgery log with training credits
			const surgeryLog = await this.surgeryLogRepo.findOne({
				where: { surgeryId: { $eq: surgeryId } },
			});

			if (!surgeryLog?.trainingCredits?.length) {
				console.warn(`No training credits to revert for surgery: ${surgeryId}`);
				return;
			}

			// 2. Get associated surgery to find procedure
			const surgery = await queryRunner.manager.findOne(Surgery, {
				where: { id: surgeryId },
				relations: ["procedure"],
				lock: { mode: "pessimistic_write" },
			});

			if (!surgery?.procedure) {
				throw new Error(`Surgery ${surgeryId} has no associated procedure`);
			}

			// 3. Collect all user IDs from verified credits (keep duplicates)
			const verifiedUserIds = surgeryLog.trainingCredits
				.filter((credit) => credit.verified)
				.map((credit) => credit.userId);

			// 4. Decrement progress for each credit entry
			await this.adjustProgress(
				queryRunner,
				verifiedUserIds,
				surgery.procedure,
				-1
			);

			await queryRunner.commitTransaction();
			console.log(
				`Successfully reverted training credits for surgery: ${surgeryId}`
			);
		} catch (error) {
			await queryRunner.rollbackTransaction();
			logger.error(
				`Failed to revert training credits for surgery ${surgeryId}:`,
				error
			);
			throw new Error(`Training credit reversal failed: ${error.message}`);
		} finally {
			await queryRunner.release();
		}
	}
}
