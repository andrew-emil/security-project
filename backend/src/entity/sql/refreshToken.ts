import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User.js";
import bcrypt from "bcrypt";

@Entity()
export class RefreshToken {
	@PrimaryGeneratedColumn("increment")
	id: number;

	@Column({ type: "varchar", nullable: false })
	token: string;

	@Column({ type: "timestamp" })
	expiresAt: Date;

	@ManyToOne(() => User, (user) => user.refreshTokens, {
		onDelete: "CASCADE",
	})
	user: User;

	@CreateDateColumn()
	createdAt: Date;

	async compareToken(plainToken: string): Promise<boolean> {
		return bcrypt.compare(plainToken, this.token);
	}
}
