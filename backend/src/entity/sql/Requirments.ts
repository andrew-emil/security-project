import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./Roles.js";
import { ProcedureType } from "./ProcedureType.js";

@Entity()
export class Requirement {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Role, (role) => role.requirements)
	role: Role;

	@ManyToOne(() => ProcedureType, (procedure) => procedure.requirements)
	procedure: ProcedureType;

	@Column({ type: "int" })
	requiredCount: number;
}
