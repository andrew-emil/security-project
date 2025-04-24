import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User.js";
import { ProcedureType } from "./ProcedureType.js";

@Entity()
export class UserProgress {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.progress)
	user: User;

	@ManyToOne(() => ProcedureType, (procedure) => procedure.progress)
	procedure: ProcedureType;

	@Column({ type: "int" })
	completedCount: number;

	@CreateDateColumn()
	completedAt: Date;
}
