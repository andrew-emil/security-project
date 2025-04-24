import { Router } from "express";
import { addSurgicalRole } from "./controllers/addSurgicalRole.js";
import { authUser } from "../../middlewares/authMiddleware.js";
import { auditLogger } from "../../middlewares/auditLogger.js";
import { getSurgicalRoles } from "./controllers/getSurgicalRoles.js";
import { updateSurgicalRole } from "./controllers/updatedSurgicalRole.js";
import { deleteSurgicalRole } from "./controllers/deleteSurgicalRole.js";

const surgicalRoleRoutes = Router();

surgicalRoleRoutes.get("/", getSurgicalRoles);

surgicalRoleRoutes.use(authUser(["Admin", "Consultant"]), auditLogger());

surgicalRoleRoutes.post("/", addSurgicalRole);
surgicalRoleRoutes.put("/:id", updateSurgicalRole);
surgicalRoleRoutes.delete("/:id", deleteSurgicalRole);

export default surgicalRoleRoutes;
