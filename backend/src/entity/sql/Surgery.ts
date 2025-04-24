import {
	Column,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Affiliations } from "./Affiliations.js";
import { AuthenticationRequest } from "./AuthenticationRequests.js";
import { Department } from "./departments.js";
import { SURGERY_TYPE } from "../../utils/dataTypes.js";
import { SurgeryEquipment } from "./SurgeryEquipments.js";
import { ProcedureType } from "./ProcedureType.js";

@Entity()
export class Surgery {
	@PrimaryGeneratedColumn("increment")
	id: number;

	@Column({ type: "varchar" })
	name: string;

	@ManyToOne(() => Affiliations, {
		onDelete: "SET NULL",
		nullable: true,
		onUpdate: "CASCADE",
	})
	hospital: Affiliations;

	@ManyToOne(() => Department, {
		onDelete: "SET NULL",
		nullable: true,
		onUpdate: "CASCADE",
	})
	department: Department;

	@OneToMany(() => AuthenticationRequest, (req) => req.surgery)
	authentication: AuthenticationRequest;

	@ManyToMany(() => SurgeryEquipment, (equipment) => equipment.surgery)
	surgeryEquipments: SurgeryEquipment[];

	@ManyToOne(() => ProcedureType, (procedure) => procedure.surgeries)
	procedure: ProcedureType;
}
