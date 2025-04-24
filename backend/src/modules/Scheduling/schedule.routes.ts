import { Router } from "express";
import { getAvailabilityCalendar } from "./controllers/getAvailabilityCalendar.js";
import { getRecommendedStaff } from "./controllers/getRecommendedStaff.js";
import { getConflictResolutionData } from "./controllers/getConflictResolutionData.js";
import { authUser } from "../../middlewares/authMiddleware.js";

const scheduleRoutes = Router();

scheduleRoutes.use(authUser(["Admin", "Consultant"]));

scheduleRoutes.get("/availability-calendar/:userId", getAvailabilityCalendar);
scheduleRoutes.post("/recommend-staff", getRecommendedStaff);
scheduleRoutes.get("/confliction-data", getConflictResolutionData);

export default scheduleRoutes;
