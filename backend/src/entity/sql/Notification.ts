import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import {
	NOTIFICATION_TYPES,
} from "../../utils/dataTypes.js";
import { User } from "./User.js";

@Entity()
export class Notification {
	@PrimaryGeneratedColumn("increment")
	id: number;

	@ManyToOne(() => User, (user) => user.notifications, { onDelete: "CASCADE" })
	user: User;

	@Column({ type: "enum", enum: NOTIFICATION_TYPES })
	type: NOTIFICATION_TYPES;

	@Column({ type: "text" })
	message: string;

	@Column({ type: "boolean", default: false })
	read: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
