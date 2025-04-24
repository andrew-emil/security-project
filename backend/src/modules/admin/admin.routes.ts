import { Router } from "express";
import { getPendingUsers } from "./controllers/getPendingUsers.js";
import { authUser } from "../../middlewares/authMiddleware.js";
import { approveUserAccount } from "./controllers/aprroveUserAccount.js";
import { rejectUserAccount } from "./controllers/rejectUserAcount.js";
import { getSuccessRates } from "./controllers/getSuccessRates.js";
import { getComplications } from "./controllers/getComplications.js";
import { getPerformance } from "./controllers/getTeamPerformance.js";
import { exportLog } from "./controllers/exportLog.js";
import { getAuditTrail } from "./controllers/getAuditTrail.js";
import { getUsers } from "./controllers/getUsers.js";
import { promoteUser } from "./controllers/promoteUsers.js";
import { getDataCount } from "./controllers/getDataCount.js";
import { delegateUser } from "./controllers/delegateUser.js";

const adminRoutes = Router();

adminRoutes.use(authUser(["Admin"]));

adminRoutes.get("/pending-users", getPendingUsers);
adminRoutes.patch("/approve-user/:userId", approveUserAccount);
adminRoutes.patch("/reject-user/:userId", rejectUserAccount);
// adminRoutes.get("/dashboard/success-rates", getSuccessRates);
// adminRoutes.get("/dashboard/complication-trends", getComplications);
// adminRoutes.get("/dashboard/data-count", getDataCount);
adminRoutes.get("/dashboard/team-performance/:affiliationId", getPerformance);
adminRoutes.get("/export", exportLog);
adminRoutes.get("/audit", getAuditTrail);
adminRoutes.get("/users", getUsers);
adminRoutes.patch("/promote/:userId", promoteUser);
adminRoutes.patch("/delegate/:userId/:roleId", delegateUser);

export default adminRoutes;
