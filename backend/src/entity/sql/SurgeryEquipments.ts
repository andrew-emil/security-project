import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToMany,
	JoinTable,
} from "typeorm";
import { Surgery } from "./Surgery.js";

@Entity()
export class SurgeryEquipment {
	@PrimaryGeneratedColumn("increment")
	id: number;

	@Column({ length: 255, type: "varchar" })
	equipment_name: string;

	@Column({ type: "blob", nullable: true })
	photo: Buffer;

	@ManyToMany(() => Surgery, (surgery) => surgery.surgeryEquipments)
	@JoinTable({
		name: "surgery_equipment_mapping",
	})
	surgery: Surgery[];
}
