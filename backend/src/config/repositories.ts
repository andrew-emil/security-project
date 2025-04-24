import { AppDataSource, MongoDataSource } from "./data-source.js";
import { Repository, MongoRepository } from "typeorm";

import { PostSurgery } from "../entity/mongodb/PostSurgery.js";
import { User } from "../entity/sql/User.js";
import { Role } from "../entity/sql/Roles.js";
import { Affiliations } from "../entity/sql/Affiliations.js";
import { AuthenticationRequest } from "../entity/sql/AuthenticationRequests.js";
import { Department } from "../entity/sql/departments.js";
import { Notification } from "../entity/sql/Notification.js";
import { SurgeryEquipment } from "../entity/sql/SurgeryEquipments.js";
import { SurgeryLog } from "../entity/mongodb/SurgeryLog.js";
import { Rating } from "../entity/mongodb/Rating.js";
import { AuditTrail } from "../entity/mongodb/AuditTrail.js";
import { Surgery } from "../entity/sql/Surgery.js";
import { Permission } from "../entity/sql/Permission.js";
import { ProcedureType } from "../entity/sql/ProcedureType.js";
import { Requirement } from "../entity/sql/Requirments.js";
import { UserProgress } from "../entity/sql/UserProgress.js";
import { SurgicalRole } from "../entity/sql/SurgicalRoles.js";
import { RefreshToken } from "../entity/sql/refreshToken.js";

// Export repositories for all entities
export let userRepo: Repository<User>;
export let roleRepo: Repository<Role>;
export let affiliationRepo: Repository<Affiliations>;
export let authenticationRequestRepo: Repository<AuthenticationRequest>;
export let departmentRepo: Repository<Department>;
export let surgeryEquipmentRepo: Repository<SurgeryEquipment>;
export let surgeryRepo: Repository<Surgery>;
export let notificationRepo: Repository<Notification>;
export let permissionRepo: Repository<Permission>;
export let procedureTypeRepo: Repository<ProcedureType>;
export let requirementRepo: Repository<Requirement>;
export let userProgressRepo: Repository<UserProgress>;
export let surgicalRolesRepo: Repository<SurgicalRole>
export let tokensRepo: Repository<RefreshToken>;

export let auditTrailRepo: MongoRepository<AuditTrail>;
export let postSurgeryRepo: MongoRepository<PostSurgery>;
export let surgeryLogsRepo: MongoRepository<SurgeryLog>;
export let ratingRepo: MongoRepository<Rating>;

export const initializeSQLRepositories = () => {
	userRepo = AppDataSource.getRepository(User);
	roleRepo = AppDataSource.getRepository(Role);
	affiliationRepo = AppDataSource.getRepository(Affiliations);
	authenticationRequestRepo = AppDataSource.getRepository(
		AuthenticationRequest
	);
	departmentRepo = AppDataSource.getRepository(Department);
	surgeryEquipmentRepo = AppDataSource.getRepository(SurgeryEquipment);
	surgeryRepo = AppDataSource.getRepository(Surgery);
	notificationRepo = AppDataSource.getRepository(Notification);
	permissionRepo = AppDataSource.getRepository(Permission);
	procedureTypeRepo = AppDataSource.getRepository(ProcedureType);
	requirementRepo = AppDataSource.getRepository(Requirement);
	userProgressRepo = AppDataSource.getRepository(UserProgress);
	surgicalRolesRepo = AppDataSource.getRepository(SurgicalRole);
	tokensRepo = AppDataSource.getRepository(RefreshToken);
};

export const initializeMongoRepositories = () => {
	postSurgeryRepo = MongoDataSource.getMongoRepository(PostSurgery);
	surgeryLogsRepo = MongoDataSource.getMongoRepository(SurgeryLog);
	ratingRepo = MongoDataSource.getMongoRepository(Rating);
	auditTrailRepo = MongoDataSource.getMongoRepository(AuditTrail);
};
