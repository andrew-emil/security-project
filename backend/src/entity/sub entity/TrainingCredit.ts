import { Column } from "typeorm";

export class TrainingCredit {
	@Column({ type: "string" })
	userId: string;

	@Column({ type: "int" })
	roleId: number;

	@Column({ type: "boolean" })
	verified: boolean;

	@Column({ type: "string" })
	verifiedBy: string;

	@Column({ type: 'timestamp' })
	verifiedAt: Date;
}