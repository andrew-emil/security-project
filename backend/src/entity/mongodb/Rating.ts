import {
	Entity,
	ObjectIdColumn,
	ObjectId,
	Column,
	CreateDateColumn,
} from "typeorm";
import { Min, Max } from "class-validator";

@Entity()
export class Rating {
	@ObjectIdColumn()
	id: ObjectId;

	@Column({ type: "int" })
	surgeryId: number;

	@Column({ type: "string" })
	userId: string;

	@Column({ type: "int" })
	@Min(1)
	@Max(5)
	stars: number;

	@Column({ type: "text", default: "" })
	comment: string;

	@CreateDateColumn({ type: "timestamp" })
	createdAt: Date;
}
