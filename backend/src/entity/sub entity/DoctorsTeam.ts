import { Column } from "typeorm";
import { PARTICIPATION_STATUS } from "../../utils/dataTypes.js";

export class DoctorsTeam {
	@Column({ type: "uuid" })
	doctorId: string;

	@Column({ type: "int" })
	roleId: number;

	@Column({
		type: "enum",
		enum: PARTICIPATION_STATUS,
		default: PARTICIPATION_STATUS.PENDING,
	})
	participationStatus: PARTICIPATION_STATUS;

	@Column({ type: "string", nullable: true })
	notes: string;

	constructor(
		doctorId: string,
		roleId: number,
		participationStatus?: PARTICIPATION_STATUS,
		notes?: string
	) {
		this.doctorId = doctorId;
		this.roleId = roleId;
		this.participationStatus = participationStatus
			? participationStatus
			: PARTICIPATION_STATUS.PENDING;
		this.notes = notes ? notes : null;
	}
}
