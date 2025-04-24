import { Router } from "express";
import { validateEquipmentPhoto } from "../../middlewares/filesMiddleware.js";
import { addSurgeryEquipment } from "./controllers/addSurgeryEquipment.js";
import { getSurgeryEquipments } from "./controllers/getSurgeryEquipments.js";
import { deleteEquipment } from "./controllers/deleteEquipment.js";
import { updateEquipment } from "./controllers/updateEquipment.js";
import { authUser } from "../../middlewares/authMiddleware.js";
import { auditLogger } from "../../middlewares/auditLogger.js";
import { getEquipmentById } from "./controllers/getEquipmentById.js";

const surgeryEquiRoutes = Router();

surgeryEquiRoutes.get("/", getSurgeryEquipments);
surgeryEquiRoutes.get("/:id", getEquipmentById);

surgeryEquiRoutes.delete("/:id", auditLogger(), deleteEquipment);

surgeryEquiRoutes.use(validateEquipmentPhoto, auditLogger());

surgeryEquiRoutes.post("/", addSurgeryEquipment);
surgeryEquiRoutes.put("/:id", updateEquipment);

export default surgeryEquiRoutes;
