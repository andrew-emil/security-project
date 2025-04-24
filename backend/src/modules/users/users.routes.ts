import { Router } from "express";
import { login } from "./controllers/login.js";
import { verify2FA } from "./controllers/verify2FA.js";
import { register } from "./controllers/register.js";
import { forgetPassword } from "./controllers/forgetPassword.js";
import { resetPassword } from "./controllers/resetPassword.js";
import { auditLogger } from "../../middlewares/auditLogger.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { validateUserPhoto } from "../../middlewares/filesMiddleware.js";
import { getUserData } from "./controllers/getUserData.js";
import { getTrainingProgress } from "./controllers/getTrainingProgress.js";
import { getRoleRequirment } from "./controllers/getRoleRequirment.js";
import { refreshRoute } from "./controllers/refreshRoute.js";
import { logout } from "./controllers/logout.js";

const usersRoutes = Router();

usersRoutes.post("/forget-password", forgetPassword);

usersRoutes.post("/refresh", refreshRoute);
usersRoutes.post("/login", auditLogger("Login"), login);

usersRoutes.post(
	"/register",
	validateUserPhoto,
	auditLogger("Signup"),
	register
);

usersRoutes.post("/verify", auditLogger("Verify"), verify2FA);

usersRoutes.post("/reset-password", auditLogger(), resetPassword);

usersRoutes.post("/logout", logout);

usersRoutes.use(authMiddleware);

usersRoutes.get("/", getUserData);

usersRoutes.get("/training/progress", getTrainingProgress);

usersRoutes.get("/roles/requirements", getRoleRequirment);

export default usersRoutes;
