import { Repository } from "typeorm";
import { ProcedureType } from "../entity/sql/ProcedureType.js";
import { SURGERY_TYPE } from "../utils/dataTypes.js";

interface CreateProcedureTypeDTO {
	name: string;
	category: SURGERY_TYPE;
}

interface UpdateProcedureTypeDTO {
	name?: string;
	category?: SURGERY_TYPE;
}

export class ProcedureTypeService {
	constructor(private procedureTypeRepo: Repository<ProcedureType>) {}

	async createProcedureType(
		data: CreateProcedureTypeDTO
	): Promise<ProcedureType> {
		const procedureType = this.procedureTypeRepo.create(data);
		return await this.procedureTypeRepo.save(procedureType);
	}

	async getProcedureTypeById(id: number): Promise<ProcedureType | null> {
		const procedureType = await this.procedureTypeRepo.findOne({
			where: {
				id,
			},
		});
		return procedureType || null;
	}

	async getAllProcedureTypes(): Promise<ProcedureType[]> {
		return await this.procedureTypeRepo.find();
	}

	async updateProcedureType(
		id: number,
		updateData: UpdateProcedureTypeDTO
	): Promise<ProcedureType | null> {
		const procedureType = await this.procedureTypeRepo.findOne({
			where: {
				id,
			},
		});
		if (!procedureType) {
			return null;
		}
		const updatedProcedureType = this.procedureTypeRepo.merge(
			procedureType,
			updateData
		);
		return await this.procedureTypeRepo.save(updatedProcedureType);
	}
	async deleteProcedureType(id: number): Promise<boolean> {
		const result = await this.procedureTypeRepo.delete(id);
		return result.affected !== undefined && result.affected > 0;
	}
}
