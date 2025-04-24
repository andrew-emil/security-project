import { Entity, ObjectIdColumn, ObjectId, Column, Index, CreateDateColumn } from "typeorm";
import { OUTCOME, DISCHARGE_STATUS } from "../../utils/dataTypes.js";

@Entity()
export class PostSurgery {
	@ObjectIdColumn()
	id: ObjectId;

	@Index()
	@Column({ type: "int" })
	surgeryId: number;

	@Index()
	@Column({ type: "int" })
	surgicalTimeMinutes: number;

	@Column({ type: "enum", enum: OUTCOME, nullable: true })
	outcome: OUTCOME;

	@Column({ type: "string", nullable: true })
	complications: string;

	@Column({
		type: "enum",
		enum: DISCHARGE_STATUS,
		default: DISCHARGE_STATUS.OBSERVATION,
	})
	dischargeStatus: DISCHARGE_STATUS;

	@Column({ type: "string", nullable: true })
	caseNotes: string;

	@Index()
	@CreateDateColumn({ type: "timestamp" })
	createdAt: Date;

	@Index()
	@Column({ type: "timestamp", nullable: true })
	dischargedAt?: Date;
}
