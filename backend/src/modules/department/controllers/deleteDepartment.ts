import { Request, Response } from "express";
import { departmentRepo } from "../../../config/repositories.js";
import { AppDataSource } from "../../../config/data-source.js";

export const deleteDepartment = async (req: Request, res: Response) => {
	const { id } = req.params;
	if (!id || isNaN(parseInt(id))) throw Error("Invalid department ID");

	const departmentId = parseInt(id);
	const department = await departmentRepo.findOne({
		where: { id: departmentId },
		relations: ["users"],
	});

	if (!department) throw Error("Department Not Found");

	await AppDataSource.transaction(async (transactionalEntityManager) => {
		if (department.users.length > 0) {
			await transactionalEntityManager
				.createQueryBuilder()
				.update("User")
				.set({ department: null })
				.where("departmentId = :departmentId", { departmentId })
				.execute();
		}

		await transactionalEntityManager.remove(department);
	});

	res.status(204).end();
};
