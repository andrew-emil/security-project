import { Router } from "express";
import { auditLogger } from "../../middlewares/auditLogger.js";
import { addAffiliation } from "./controllers/addAffiliation.js";
import { getAffiliations } from "./controllers/getAffiliations.js";
import { deleteAffiliation } from "./controllers/deleteAffiliation.js";
import { updateAffiliation } from "./controllers/updateAffiliation.js";
import { authMiddleware, authUser } from "../../middlewares/authMiddleware.js";
import { getAffiliationById } from "./controllers/getAffiliationById.js";

const affiliationRoutes = Router();

affiliationRoutes.get("/", getAffiliations);
affiliationRoutes.get("/:id", getAffiliationById);

affiliationRoutes.use(auditLogger());
affiliationRoutes.use(authMiddleware);

affiliationRoutes.post("/", authUser(["Admin"]), addAffiliation);

affiliationRoutes.delete("/:id", authUser(["Admin"]), deleteAffiliation);

affiliationRoutes.patch("/", authUser(["Admin"]), updateAffiliation);

export default affiliationRoutes;
