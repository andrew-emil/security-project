import { Column, ObjectIdColumn } from "typeorm";
import { ObjectId } from "mongodb";

export class PatientDetails {
	@ObjectIdColumn({ type: "string" })
	patient_id: ObjectId;

	@Column({ type: "int" })
	bmi: number;

	@Column({ type: "simple-array" })
	comorbidity: string[];

	@Column({ type: "string" })
	diagnosis: string;

	constructor(bmi: number, comorbidity: string[], diagnosis: string) {
		this.patient_id = new ObjectId();
		this.bmi = bmi;
		this.comorbidity = comorbidity;
		this.diagnosis = diagnosis;
	}
}
