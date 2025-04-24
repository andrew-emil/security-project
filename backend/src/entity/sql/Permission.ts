import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./Roles.js";

@Entity()
export class Permission {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", unique: true })
	action: string;

	@ManyToMany(() => Role, (role) => role.permissions)
	role: Role;
}
