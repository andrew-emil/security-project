import {
	Column,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User.js";
import { Affiliations } from "./Affiliations.js";

@Entity()
export class Department {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 255, type: "varchar" })
	name: string;

	@OneToMany(() => User, (user) => user.department)
	users: User[];

	@ManyToOne(() => Affiliations, (affiliation) => affiliation.departments, {
		onDelete: "CASCADE",
	})
	affiliation: Affiliations;
}
