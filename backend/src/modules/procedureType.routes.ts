import { Router, Request, Response } from "express";
import { procedureTypeService } from "../config/initializeServices.js";


const procedureTypeRoutes = Router();

procedureTypeRoutes.post("/", async (req: Request, res: Response) => {
	const { name, category } = req.body;

	if (!name || !category) throw Error("Invalid credentails");

	await procedureTypeService.createProcedureType({
		name,
		category,
	});
	res.status(201).json({ message: "Procedure type added successfully" });
});

procedureTypeRoutes.get("/", async (req: Request, res: Response) => {
	const procedureTypes = await procedureTypeService.getAllProcedureTypes();
	res.status(200).json(procedureTypes);
});

procedureTypeRoutes.put("/:id", async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);
	const updateData = req.body;

	const updatedProcedureType = await procedureTypeService.updateProcedureType(
		id,
		updateData
	);
	if (!updatedProcedureType) {
		throw Error("ProcedureType not found");
	}
	res.status(200).json({ message: "Procedure type updated successfully" });
});

procedureTypeRoutes.delete("/:id", async (req: Request, res: Response) => {
	const id = parseInt(req.params.id, 10);

	const deleted = await procedureTypeService.deleteProcedureType(id);
	if (!deleted) {
		throw Error("ProcedureType not found");
	}
	res.status(204).json();
});

export default procedureTypeRoutes;
