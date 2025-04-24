import { Router } from "express";
import { addRating } from "./controllers/addRating.js";
import { deleteRating } from "./controllers/deleteRating.js";
import { updateRating } from "./controllers/updateRating.js";
import { auditLogger } from "../../middlewares/auditLogger.js";

const ratingRoutes = Router();

//middlwares...
ratingRoutes.use(auditLogger());

//protected routes...
ratingRoutes.post("/", addRating);
ratingRoutes.delete("/:id", deleteRating);
ratingRoutes.patch("/:id", updateRating);

export default ratingRoutes;
