import { Router } from "express";
import { createRequest } from "./controllers/createRequest.js";
import { approveRequest } from "./controllers/aprroveRequest.js";
import { rejectRequest } from "./controllers/cancelRequest.js";
import { getRequests } from "./controllers/getRequests.js";
import { editRequest } from "./controllers/editRequest.js";
import { deleteRequest } from "./controllers/deleteRequest.js";
import { auditLogger } from "../../middlewares/auditLogger.js";
import { authUser } from "../../middlewares/authMiddleware.js";

const authRequestsRoutes = Router();

authRequestsRoutes.get(
	"/:surgeryId/request",
	authUser(["Admin", "Consultant"]),
	getRequests
);

authRequestsRoutes.use(auditLogger());

authRequestsRoutes.post("/", createRequest);
authRequestsRoutes.put(
	"/:id/approve",
	authUser(["Admin", "Consultant"]),
	approveRequest
);
authRequestsRoutes.put(
	"/:id/reject",
	authUser(["Admin", "Consultant"]),
	rejectRequest
);
authRequestsRoutes.put("/", editRequest);
authRequestsRoutes.delete("/:id", deleteRequest);

export default authRequestsRoutes;
