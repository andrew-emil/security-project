import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User.js";
import { Authentication_Request } from "../../utils/dataTypes.js";
import { Surgery } from "./Surgery.js";
import { SurgicalRole } from "./SurgicalRoles.js";

@Entity()
export class AuthenticationRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: "enum",
		enum: Authentication_Request,
		default: Authentication_Request.PENDING,
	})
	status: Authentication_Request;

	@CreateDateColumn()
	created_at: Date;

	@ManyToOne(() => Surgery, (surg) => surg.authentication, {
		onDelete: "CASCADE",
	})
	surgery: Surgery;

	@ManyToOne(() => SurgicalRole)
	requestedRole: SurgicalRole;

	@ManyToOne(() => User)
	trainee: User;

	@ManyToOne(() => User)
	consultant: User;

	@Column({ type: "timestamp", nullable: true })
	approvedAt: Date;

	@Column({ type: "varchar", nullable: true })
	rejectionReason: string;
}
