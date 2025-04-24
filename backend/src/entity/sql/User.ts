import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from "typeorm";
import { Role } from "./Roles.js";
import { Department } from "./departments.js";
import { Affiliations } from "./Affiliations.js";
import { Notification } from "./Notification.js";
import { USER_STATUS } from "../../utils/dataTypes.js";
import { UserProgress } from "./UserProgress.js";
import { RefreshToken } from "./refreshToken.js";

@Entity()
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ length: 50, type: "varchar" })
	first_name: string;

	@Column({ length: 50, type: "varchar" })
	last_name: string;

	@Column({ length: 100, unique: true, type: "varchar" })
	email: string;

	@Column({ length: 255, type: "varchar" })
	password_hash: string;

	@Column({ length: 20, type: "varchar", unique: true })
	phone_number: string;

	@Column({ type: "blob", nullable: true })
	picture: Buffer;

	@ManyToOne(() => Role, (role) => role.users, {
		onDelete: "SET NULL",
		nullable: true,
		onUpdate: "CASCADE",
	})
	role: Role;

	@ManyToOne(() => Affiliations, (affiliation) => affiliation.users, {
		onDelete: "SET NULL",
		nullable: true,
		onUpdate: "CASCADE",
	})
	affiliation: Affiliations;

	@ManyToOne(() => Department, (department) => department.users, {
		onDelete: "SET NULL",
		nullable: true,
		onUpdate: "CASCADE",
	})
	department: Department;

	@OneToMany(() => Notification, (notification) => notification.user)
	notifications: Notification[];

	@Column({ type: "enum", enum: USER_STATUS, default: USER_STATUS.PENDING })
	account_status: USER_STATUS;

	@OneToMany(() => UserProgress, (progress) => progress.user)
	progress: UserProgress[];

	@Column({ type: "timestamp", nullable: true })
	last_login: Date;

	@Column({ type: "varchar", nullable: true })
	rejectionReason: string;

	@Column({ type: "timestamp", nullable: true })
	lock_until: Date;

	@Column({ type: "varchar", nullable: true })
	otp_secret: string;

	@Column({ type: "int", default: 0 })
	failed_attempts: number;

	@Column({ type: "int", default: 0 })
	token_version: number;

	@Column({ type: "varchar", nullable: true })
	activation_token: string;

	@Column({ type: "timestamp", nullable: true })
	token_expiry: Date;

	@Column({ type: "varchar", nullable: true })
	reset_token: string;

	@Column({ type: "timestamp", nullable: true })
	reset_token_expires: Date;

	@OneToMany(() => RefreshToken, (token) => token.user)
	refreshTokens: RefreshToken[];

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
