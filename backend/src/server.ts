import "reflect-metadata";
import "express-async-errors";

import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import usersRoutes from "./modules/users/users.routes.js";
import { AppDataSource, MongoDataSource } from "./config/data-source.js";
import { errorHandler } from "./handlers/errorHandler.js";
import {
	initializeMongoRepositories,
	initializeSQLRepositories,
} from "./config/repositories.js";
import rolesRoutes from "./modules/roles/roles.routes.js";
import departmentRoutes from "./modules/department/department.routes.js";
import surgeryRoutes from "./modules/surgery/surgery.routes.js";
import affiliationRoutes from "./modules/affiliations/affiliations.routes.js";
import authRequestsRoutes from "./modules/authRequests/authRequests.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import { intializeServices } from "./config/initializeServices.js";
import surgeryEquiRoutes from "./modules/surgeryEquipments/surgeryEquip.routes.js";
import ratingRoutes from "./modules/rating/rating.routes.js";
import scheduleRoutes from "./modules/Scheduling/schedule.routes.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import logger from "./config/loggerConfig.js";
import procedureTypeRoutes from "./modules/procedureType.routes.js";
import { notFoundHandler } from "./handlers/notFoundHandler.js";
import surgicalRoleRoutes from "./modules/surgicalRole/surgicalRole.routes.js";
import { seed } from "./config/databaseSeed.js";

config({ path: "./.env" });
const app: Application = express();
const port: number = parseInt(process.env.PORT as string);
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.BASE_URL as string,
		methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
		credentials: true,
	},
});

io.on("connection", (socket) => {
	logger.info(`User connected: ${socket.id}`);

	socket.on("disconnect", () => {
		console.log(`User disconnected: ${socket.id}`);
	});
});

app.use(express.json());
app.use(
	morgan("dev", {
		stream: {
			write: (message: string) => logger.info(message.trim()),
		},
	})
);
app.use(cookieParser());
app.use(
	cors({
		origin: process.env.BASE_URL as string,
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

app.use("/api/users", usersRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/affiliation", affiliationRoutes);

app.use(authMiddleware);
app.use("/api/surgery", surgeryRoutes);
app.use("/api/auth-requests", authRequestsRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/surgery-equipments", surgeryEquiRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/procedure-types", procedureTypeRoutes);
app.use("/api/surgical-role", surgicalRoleRoutes);

const startServer = async () => {
	try {
		await AppDataSource.initialize();
		await AppDataSource.synchronize();
		initializeSQLRepositories();
		logger.info("Connected to MySQL database");

		await MongoDataSource.initialize();
		initializeMongoRepositories();
		logger.info("Connected to MongoDB database successfully");

		intializeServices();

		server.listen(port, () => {
			logger.info(`app listening on port: ${port}`);
		});
	} catch (error) {
		logger.error("Server initialization failed:", error);
		process.exit(1);
	}
};

app.use(notFoundHandler);

app.use(errorHandler);

export { io, server };

startServer().then(async () => {
	await seed();
	logger.info("database seed initaited successfully");
});
