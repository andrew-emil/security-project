import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Requirement } from "./Requirments.js";
import { Surgery } from "./Surgery.js";
import { UserProgress } from "./UserProgress.js";
import { SURGERY_TYPE } from "../../utils/dataTypes.js";

@Entity()
export class ProcedureType {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar" })
	name: string;

	@Column({
		type: "enum",
		enum: SURGERY_TYPE,
	})
	category: SURGERY_TYPE;

	@OneToMany(() => Requirement, (requirement) => requirement.procedure)
	requirements: Requirement[];

	@OneToMany(() => Surgery, (surergy) => surergy.procedure)
	surgeries: Surgery;

	@OneToMany(() => UserProgress, (progress) => progress.procedure)
	progress: UserProgress;
}
