import { Router } from "express";
import { createNotification } from "./controllers/createNotification.js";
import { getNotification } from "./controllers/getNotification.js";
import { markNotificationAsRead } from "./controllers/markNotificationAsRead.js";

const notificationRoutes = Router();

notificationRoutes.post("/", createNotification);
notificationRoutes.get("/:userId", getNotification);
notificationRoutes.patch("/", markNotificationAsRead);

export default notificationRoutes;
