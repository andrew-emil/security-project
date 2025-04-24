import { z } from "zod";
import {
	AffiliationsType,
	DISCHARGE_STATUS,
	OUTCOME,
	NOTIFICATION_TYPES,
	PARTICIPATION_STATUS,
	SURGERY_TYPE,
} from "./dataTypes.js";

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const registerSchema = z.object({
	first_name: z
		.string()
		.min(1, "First name is required")
		.max(50, "First name cannot exceed 50 characters")
		.regex(/^[a-zA-Z]+$/, "First name can only contain letters"),

	last_name: z
		.string()
		.min(1, "Last name is required")
		.max(50, "Last name cannot exceed 50 characters")
		.regex(/^[a-zA-Z]+$/, "Last name can only contain letters"),

	email: z
		.string()
		.min(1, "Email is required")
		.email("Invalid email format")
		.max(100, "Email cannot exceed 100 characters"),

	phone_number: z
		.string()
		.min(1, "Phone number is required")
		.min(8, "Phone number must be at least 8 digits")
		.max(15, "Phone number cannot exceed 15 digits")
		.regex(
			/^\+[0-9]+$/,
			"Phone number must start with + and contain only digits"
		)
		.refine((val) => val.length >= 8 && val.length <= 15, {
			message:
				"Phone number must be between 8-15 digits including country code",
		}),

	password: z
		.string()
		.min(1, "Password is required")
		.min(8, "Password must be at least 8 characters")
		.max(50, "Password cannot exceed 50 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one number")
		.regex(
			/[^a-zA-Z0-9]/,
			"Password must contain at least one special character"
		),
	roleId: z.string(),
	affiliationId: z.string(),
	departmentId: z.string(),
});

export const updateAccountSchema = z
	.object({
		first_name: z
			.string()
			.min(1, "First name cannot be empty")
			.max(50, "First name cannot exceed 50 characters")
			.regex(/^[a-zA-Z]+$/, "First name can only contain letters")
			.optional(),

		last_name: z
			.string()
			.min(1, "Last name cannot be empty")
			.max(50, "Last name cannot exceed 50 characters")
			.regex(/^[a-zA-Z]+$/, "Last name can only contain letters")
			.optional(),

		email: z
			.string()
			.email("Invalid email format")
			.max(100, "Email cannot exceed 100 characters")
			.optional(),

		phone_number: z
			.string()
			.min(8, "Phone number must be at least 8 digits")
			.max(15, "Phone number cannot exceed 15 digits")
			.regex(
				/^\+[0-9]+$/,
				"Phone number must start with + and contain only digits"
			)
			.optional(),

		old_password: z.string().optional(),

		new_password: z
			.string()
			.min(8, "New password must be at least 8 characters")
			.max(50, "Password cannot exceed 50 characters")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[0-9]/, "Password must contain at least one number")
			.regex(
				/[^a-zA-Z0-9]/,
				"Password must contain at least one special character"
			)
			.optional(),

		picture: z
			.string()
			.optional()
			.refine(
				(val) => !val || /^data:image\/(png|jpeg|jpg);base64,/.test(val),
				{
					message: "Image must be in JPEG or PNG format",
				}
			)
			.transform((val) =>
				val ? Buffer.from(val.split(",")[1], "base64") : undefined
			),
	})
	.refine((data) => !(data.new_password && !data.old_password), {
		message: "Old password is required to set a new password",
		path: ["old_password"],
	})
	.refine(
		(data) => !(data.old_password && data.old_password === data.new_password),
		{
			message: "New password must be different from old password",
			path: ["new_password"],
		}
	);

export const resetPasswordSchema = z.object({
	email: z.string().email(),
	token: z.string(),
	newPassword: z
		.string()
		.min(8, "New password must be at least 8 characters")
		.max(50, "Password cannot exceed 50 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one number")
		.regex(
			/[^a-zA-Z0-9]/,
			"Password must contain at least one special character"
		),
});

export const updateDepartmentSchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	affiliationId: z.string().optional(),
});

export const addAffiliationSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	city: z.string().min(2, "City must be at least 2 characters"),
	country: z.string().min(2, "Country must be at least 2 characters"),
	address: z.string().min(2, "Address must be at least 2 characters"),
	institution_type: z.nativeEnum(AffiliationsType),
});

export const updateAffiliationSchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	address: z.string().optional(),
	institution_type: z.nativeEnum(AffiliationsType).optional(),
});

export const addSurgerySchema = z.object({
	hospitalId: z.number(),
	departmentId: z.number(),
	name: z.string(),
	leadSurgeon: z.string(),
	slots: z.number(),
	procedureTypeId: z.number().positive(),
	doctorsTeam: z
		.array(
			z.object({
				doctorId: z.string(),
				roleId: z.number(),
				participationStatus: z
					.nativeEnum(PARTICIPATION_STATUS)
					.default(PARTICIPATION_STATUS.APPROVED),
				notes: z.string().optional(),
			})
		)
		.nonempty()
		.optional(),
	date: z.string().refine((d) => !isNaN(Date.parse(d)), {
		message: "Invalid date format",
	}),
	time: z.string(),
	estimatedEndTime: z.string(),
	surgeryEquipments: z.array(z.number()),
	cptCode: z.string(),
	icdCode: z.string(),
	patientBmi: z.number().optional(),
	patientComorbidity: z.array(z.string().min(1)).optional(),
	patientDiagnosis: z.string().optional(),
});

export const updateSurgerySchema = z.object({
	surgeryId: z.number().positive(),
	hospitalId: z.number().optional(),
	departmentId: z.number().optional(),
	name: z.string().optional(),
	leadSurgeon: z.string().optional(),
	procedureTypeId: z.number().positive().optional(),
	doctorsTeam: z
		.array(
			z.object({
				doctorId: z.string(),
				roleId: z.number(),
				notes: z.string().optional(),
			})
		)
		.nonempty()
		.optional(),
	date: z
		.string()
		.refine((d) => !isNaN(Date.parse(d)), {
			message: "Invalid date format",
		})
		.optional(),
	time: z.string().optional(),
	estimatedEndTime: z.string().optional(),
	surgeryEquipments: z.array(z.number()).optional(),
	slots: z.number().optional(),
	cptCode: z.string().optional(),
	icdCode: z.string().optional(),
	patientBmi: z.number().optional(),
	patientComorbidity: z.array(z.string().min(1)).optional(),
	patientDiagnosis: z.string().optional(),
	surgicalTimeMinutes: z.number().optional(),
	outcome: z.nativeEnum(OUTCOME).optional(),
	complications: z
		.string()
		.max(1000, "Complications must be less than 1000 characters")
		.optional(),
	dischargeStatus: z.nativeEnum(DISCHARGE_STATUS).optional(),
	caseNotes: z
		.string()
		.max(2000, "Case notes must be less than 2000 characters")
		.optional(),
});

export const addPostSurgerySchema = z.object({
	surgeryId: z.number(),
	surgicalTimeMinutes: z.number(),
	outcome: z.nativeEnum(OUTCOME).optional(),
	complications: z
		.string()
		.max(1000, "Complications must be less than 1000 characters")
		.optional(),
	dischargeStatus: z.nativeEnum(DISCHARGE_STATUS).optional(),
	caseNotes: z
		.string()
		.max(2000, "Case notes must be less than 2000 characters")
		.optional(),
});

export const createNotificationSchema = z.object({
	userId: z.string(),
	type: z.nativeEnum(NOTIFICATION_TYPES),
	message: z.string(),
});

export const createRequestSchema = z.object({
	surgeryId: z.number(),
	traineeId: z.string(),
	consultantId: z.string(),
	roleId: z.number(),
	notes: z.string().optional(),
});

export const editRequestSchema = z.object({
	surgeryId: z.number(),
	traineeId: z.string(),
	roleId: z.number(),
	notes: z.string().optional(),
});

export const addRoleSchema = z.object({
	name: z.string(),
	parentId: z.number(),
	permissionActions: z.array(z.number()).min(1),
	procedureRequirements: z
		.array(
			z.object({
				procedureTypeId: z.number(),
				requiredCount: z.number().min(1),
				category: z.nativeEnum(SURGERY_TYPE),
			})
		)
		.min(1),
});

export const updateRoleSchema = z.object({
	id: z.number().positive(),
	name: z.string().min(2).max(50).optional(),
	parentId: z.number().positive().optional().nullable(),
	permissions: z.array(z.number().positive()).optional(),
	procedureRequirements: z
		.array(
			z.object({
				id: z.number().positive().optional(),
				procedureTypeId: z.number().positive(),
				requiredCount: z.number().min(1),
				category: z.nativeEnum(SURGERY_TYPE),
			})
		)
		.optional(),
});

export const addRatingSchema = z.object({
	surgeryId: z.number(),
	stars: z.number().min(1).max(5),
	comment: z.string().optional(),
});

export const recommendStaffSchema = z.object({
	affiliationId: z.number().positive(),
	departmentId: z.number().positive(),
	date: z.string().refine((d) => !isNaN(Date.parse(d)), {
		message: "Invalid date format",
	}),
	time: z.string(),
});

export const exportLogSchema = z.object({
	format: z.string(),
	startDate: z.string().refine((d) => !isNaN(Date.parse(d)), {
		message: "Invalid date format",
	}),
	endDate: z.string().refine((d) => !isNaN(Date.parse(d)), {
		message: "Invalid date format",
	}),
});
