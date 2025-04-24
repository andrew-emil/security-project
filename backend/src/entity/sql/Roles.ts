import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	OneToMany,
	ManyToOne,
	ManyToMany,
	JoinTable,
	Index,
} from "typeorm";
import { User } from "./User.js";
import { Permission } from "./Permission.js";
import { Requirement } from "./Requirments.js";

@Entity()
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", unique: true })
	name: string;

	@OneToMany(() => Requirement, (requirement) => requirement.role)
	requirements: Requirement[];

	@OneToMany(() => User, (user) => user.role)
	users: User[];

	@ManyToOne(() => Role, (role) => role.children, { nullable: true })
	parent: Role;

	@OneToMany(() => Role, (role) => role.parent)
	children: Role[];

	@ManyToMany(() => Permission, (perm) => perm.role)
	@JoinTable({
		name: "role_permission",
	})
	permissions: Permission[];
}
