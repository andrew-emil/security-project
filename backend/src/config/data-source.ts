import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "../entity/sql/User.js";
import { Role } from "../entity/sql/Roles.js";
import { Affiliations } from "../entity/sql/Affiliations.js";
import { AuthenticationRequest } from "../entity/sql/AuthenticationRequests.js";
import { Department } from "../entity/sql/departments.js";
import { SurgeryEquipment } from "../entity/sql/SurgeryEquipments.js";
import { PostSurgery } from "../entity/mongodb/PostSurgery.js";
import { SurgeryLog } from "../entity/mongodb/SurgeryLog.js";
import { Surgery } from "../entity/sql/Surgery.js";
import { Rating } from "../entity/mongodb/Rating.js";
import { AuditTrail } from "../entity/mongodb/AuditTrail.js";
import { Notification } from "../entity/sql/Notification.js";
import { Permission } from "../entity/sql/Permission.js";
import { ProcedureType } from "../entity/sql/ProcedureType.js";
import { Requirement } from "../entity/sql/Requirments.js";
import { UserProgress } from "../entity/sql/UserProgress.js";
import { SurgicalRole } from "../entity/sql/SurgicalRoles.js";
import { RefreshToken } from "../entity/sql/refreshToken.js";

export const AppDataSource = new DataSource({
	type: "mysql",
	host: "mysql",
	port: 3306,
	username: "root",
	password: "",
	database: process.env.DB_NAME,
	synchronize: true,
	logging: false,
	entities: [
		User,
		Role,
		Affiliations,
		AuthenticationRequest,
		Department,
		SurgeryEquipment,
		Surgery,
		Notification,
		Permission,
		ProcedureType,
		Requirement,
		UserProgress,
		SurgicalRole,
		RefreshToken
	],
	subscribers: [],
});

export const MongoDataSource = new DataSource({
	type: "mongodb",
	url: process.env.MONGO_URI as string,
	database: "surgical_logbook",
	entities: [PostSurgery, SurgeryLog, Rating, AuditTrail],
	synchronize: true,
	logging: true,
});
