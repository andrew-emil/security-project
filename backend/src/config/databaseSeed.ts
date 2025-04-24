import {
	AffiliationsType,
	SURGERY_TYPE,
	USER_STATUS,
} from "../utils/dataTypes.js";
import bcrypt from "bcrypt";
import {
	affiliationRepo,
	departmentRepo,
	procedureTypeRepo,
	requirementRepo,
	roleRepo,
	userRepo,
} from "./repositories.js";
import { Role } from "../entity/sql/Roles.js";
import { Affiliations } from "../entity/sql/Affiliations.js";
import { Department } from "../entity/sql/departments.js";

export async function seed() {
	const affiliationLength = await affiliationRepo.count();
	let affiliations: Affiliations[];
	let departments: Department[];

	if (affiliationLength === 0) {
		affiliations = affiliationRepo.create([
			{
				name: "Central City Hospital",
				city: "Cairo",
				country: "Egypt",
				address: "123 Nile Street",
				institution_type: AffiliationsType.HOSPITAL,
			},
			{
				name: "Downtown Clinic",
				city: "Alexandria",
				country: "Egypt",
				address: "45 Corniche Road",
				institution_type: AffiliationsType.CLINIC,
			},
		]);
		await affiliationRepo.save(affiliations);

		departments = departmentRepo.create([
			{ name: "Cardiology", affiliation: affiliations[0] },
			{ name: "Neurology", affiliation: affiliations[0] },
			{ name: "General Practice", affiliation: affiliations[1] },
		]);
		await departmentRepo.save(departments);
	}

	const roleCount = await roleRepo.count();

	let roles: Role[];

	if (roleCount === 0) {
		roles = roleRepo.create([
			{ name: "admin" },
			{ name: "consultant" },
			{ name: "surgeon" },
			{ name: "nurse" },
		]);
		await roleRepo.save(roles);
		const procedures = procedureTypeRepo.create([
			{ name: "Appendectomy", category: SURGERY_TYPE.AS },
			{ name: "Bypass Surgery", category: SURGERY_TYPE.O },
			{ name: "Knee Replacement", category: SURGERY_TYPE.PS },
		]);
		await procedureTypeRepo.save(procedures);

		const requirements = requirementRepo.create([
			{ role: roles[1], procedure: procedures[0], requiredCount: 10 },
			{ role: roles[2], procedure: procedures[1], requiredCount: 5 },
			{ role: roles[3], procedure: procedures[2], requiredCount: 20 },
		]);
		await requirementRepo.save(requirements);
	}

	const usersCount = await userRepo.count();

	if (usersCount === 0) {
		const password = await bcrypt.hash(
			process.env.ADMIN_PASSWORD,
			process.env.salt_rounds
		);
		const adminUser = userRepo.create({
			first_name: "Andrew",
			last_name: "Emil",
			email: "andrewemil343@gmail.com",
			password_hash: password,
			account_status: USER_STATUS.ACTIVE,
			role: roles[0],
			affiliation: affiliations[0],
			department: departments[1],
		});

		await userRepo.save(adminUser)
	}
}
