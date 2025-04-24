import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { AffiliationsType } from "../../utils/dataTypes.js";
import { User } from "./User.js";
import { Department } from "./departments.js";
import { Surgery } from "./Surgery.js";

@Entity()
export class Affiliations {
	@PrimaryGeneratedColumn("increment")
	id: number;

	@Column({ length: 100, type: "varchar" })
	name: string;

	@Column({ length: 200, type: "varchar" })
	city: string;

	@Column({ type: "text" })
	country: string;

	@Column({ length: 255, type: "varchar" })
	address: string;

	@Column({
		type: "enum",
		enum: AffiliationsType,
		default: AffiliationsType.HOSPITAL,
	})
	institution_type: AffiliationsType;

	@OneToMany(() => User, (user) => user.affiliation)
	users: User[];

	@OneToMany(() => Department, (department) => department.affiliation)
	departments: Department[];

	@OneToMany(() => Surgery, (surgery) => surgery.hospital, { cascade: true })
	surgeries: Surgery[];
}
