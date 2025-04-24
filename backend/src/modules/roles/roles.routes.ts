import { Router } from "express";
import { addRole } from "./controllers/addRole.js";
import { deleteRole } from "./controllers/deleteRole.js";
import { getAllRoles } from "./controllers/getAllRoles.js";
import { updateRole } from "./controllers/updateRole.js";
import { auditLogger } from "./../../middlewares/auditLogger.js";
import { authMiddleware, authUser } from "../../middlewares/authMiddleware.js";
import { assignPermissions } from "./controllers/assignPermissions.js";
import { getAllPermissions } from "./controllers/getPermission.js";
import { getRoleById } from "./controllers/getRoleById.js";
import { getRoleChildren } from "./controllers/getRoleChildren.js";

const rolesRoutes = Router();

rolesRoutes.get("/", getAllRoles);

rolesRoutes.use(authMiddleware);
rolesRoutes.get("/permissions", getAllPermissions);
rolesRoutes.get("/get-role/:roleId", getRoleById);
rolesRoutes.get("/get-children/:roleId", getRoleChildren);

rolesRoutes.use(auditLogger());
rolesRoutes.post("/", authUser(["Admin", "Consultant"]), addRole);

rolesRoutes.delete("/:id", authUser(["Admin", "Consultant"]), deleteRole);

rolesRoutes.put("/", authUser(["Admin", "Consultant"]), updateRole);

rolesRoutes.put(
	"/assign-perm/:roleId",
	authUser(["Admin", "Consultant"]),
	assignPermissions
);

export default rolesRoutes;
