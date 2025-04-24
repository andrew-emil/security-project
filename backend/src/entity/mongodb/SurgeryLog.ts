import {
	Entity,
	ObjectIdColumn,
	ObjectId,
	Column,
	Index,
	VersionColumn,
	UpdateDateColumn,
	CreateDateColumn,
} from "typeorm";
import { PatientDetails } from "../sub entity/PatientDetails.js";
import { DoctorsTeam } from "../sub entity/DoctorsTeam.js";
import { STATUS } from "../../utils/dataTypes.js";
import { TrainingCredit } from "../sub entity/TrainingCredit.js";

@Entity()
export class SurgeryLog {
	@ObjectIdColumn()
	id: ObjectId;

	@Column({ type: "int" })
	@Index()
	surgeryId: number;

	@Column({ type: "string", nullable: true })
	leadSurgeon: string;

	@Column({ type: "json", nullable: true })
	doctorsTeam: DoctorsTeam[];

	@Column({ type: "date" })
	date: Date;

	@Column({ type: "string" })
	time: string;

	@Column({ type: "string" })
	esitmatedEndTime: string;

	@Column({ type: "int", nullable: true })
	stars: number;

	@Column({ type: "int", nullable: true })
	estimatedBloodLossMl: number;

	@Column({ type: "text", nullable: true })
	complications: string;

	@Column({ type: "text", nullable: true })
	bloodProductsUsed: string;

	@Column({ type: "string" })
	cptCode: string;

	@Column({ type: "string" })
	icdCode: string;

	@Column({ type: "int" })
	slots: number;

	@Column({ type: "enum", default: STATUS.ONGOING })
	status: STATUS; // Completed, Ongoing, Cancelled

	@Column(() => PatientDetails)
	patient_details: PatientDetails;

	@CreateDateColumn({ type: "timestamp" })
	createdAt: Date;

	@UpdateDateColumn({ type: "timestamp" })
	updatedAt: Date;

	@VersionColumn()
	version: number;

	@Column({ type: "json" })
	trainingCredits: TrainingCredit[];
}
