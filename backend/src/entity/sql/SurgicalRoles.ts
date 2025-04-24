import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity()
export class SurgicalRole {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", unique: true })
	name: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
