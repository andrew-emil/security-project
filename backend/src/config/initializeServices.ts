import {
	roleRepo,
	userRepo,
	surgeryLogsRepo,
	authenticationRequestRepo,
	procedureTypeRepo,
	surgeryRepo,
	ratingRepo,
	tokensRepo,
} from "../config/repositories.js";
import { AuthService } from "../service/AuthService.js";
import { FormatService } from "../service/FormatService.js";
import { NotificationService } from "../service/NotificationService.js";
import { ProcedureTypeService } from "../service/ProcedureTypeService.js";
import { ScheduleService } from "../service/ScheduleService.js";
import { SurgeryAuthService } from "../service/SurgeryAuthService.js";
import { TrainingService } from "../service/TrainingService.js";
import { UserService } from "../service/UserSevice.js";

export let trainingService: TrainingService;
export let surgeryAuthService: SurgeryAuthService;
export let notificationService: NotificationService;
export let scheduleService: ScheduleService;
export let procedureTypeService: ProcedureTypeService;
export let userService: UserService;
export let formatService: FormatService;
export let authService: AuthService;

export const intializeServices = () => {
	trainingService = new TrainingService(userRepo, roleRepo, surgeryLogsRepo);

	surgeryAuthService = new SurgeryAuthService(
		trainingService,
		authenticationRequestRepo,
		surgeryLogsRepo
	);

	notificationService = new NotificationService();

	scheduleService = new ScheduleService(userRepo, surgeryLogsRepo);
	procedureTypeService = new ProcedureTypeService(procedureTypeRepo);
	userService = new UserService(userRepo);
	formatService = new FormatService(surgeryRepo, userRepo, ratingRepo);
	authService = new AuthService(tokensRepo)
};
