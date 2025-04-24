import {
	Entity,
	ObjectIdColumn,
	Column,
	CreateDateColumn,
	ObjectId,
} from "typeorm";

@Entity()
export class AuditTrail {
	@ObjectIdColumn()
	id: ObjectId;

	@Column({ type: "uuid" })
	userId: string;

	@Column({ type: "varchar" })
	action: string;

	@Column({ type: "varchar" })
	entityName: string;

	@Column({ nullable: true, type: "varchar" })
	entityId: string; // ID of the affected record

	@Column({ nullable: true, type: "json" })
	oldValue: any;

	@Column({ nullable: true, type: "json" })
	newValue: any;

	@Column({ type: "varchar", nullable: true })
	ipAddress: string;

	@Column({ type: "varchar", nullable: true })
	userAgent: string;

	@CreateDateColumn({ type: "datetime", precision: 6 })
	timestamp: Date;
}
