import { Response } from "express";
import { roleRepo, userRepo } from "../config/repositories.js";
import { SurgeryLog } from "../entity/mongodb/SurgeryLog.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

export const transformLog = async (
	log: SurgeryLog,
	posts: any[]
): Promise<any> => {
	const post = posts.find((p) => p.surgeryId === log.surgeryId) || {};

	const leadSurgeon = await userRepo.findOne({
		where: { id: log.leadSurgeon },
		select: { first_name: true, last_name: true },
	});

	const team = await Promise.all(log.doctorsTeam.map(buildDoctorInfo));
	const patientId = safeField(log.patient_details.patient_id);
	return {
		surgeryId: log.surgeryId,
		leadSurgeon: `Dr. ${safeField(leadSurgeon.first_name)} ${safeField(
			leadSurgeon.last_name
		)}`,
		team,
		date: log.date !== null ? log.date.toString().split(" 00:")[0] : " - ",
		time: safeField(log.time),
		cptCode: safeField(log.cptCode),
		icdCode: safeField(log.icdCode),
		patient_details: {
			id: patientId.toString(),
			BMI: safeField(log.patient_details.bmi),
			comorbidity: safeField(log.patient_details.comorbidity),
			diagonsis: safeField(log.patient_details.diagnosis),
		},
		postSurgery: {
			surgicalTime: post.surgicalTimeMinutes
				? `${safeField(post.surgicalTimeMinutes)} min.`
				: "",
			outcome: safeField(post.outcome),
			complications: safeField(post.complications),
			dischargeStatus: safeField(post.dischargeStatus),
			discharedAt: safeField(post.dischargedAt),
			caseNotes: safeField(post.caseNotes),
		},
	};
};

const safeField = (value: any) =>
	value == null || value == "" ? " - " : value;

const buildDoctorInfo = async (doctor: any) => {
	const [doctorUser, roleData] = await Promise.all([
		userRepo.findOne({
			where: { id: doctor.doctorId },
			select: { first_name: true, last_name: true },
		}),
		roleRepo.findOne({
			where: { id: doctor.roleId },
			select: { name: true },
		}),
	]);
	
	return {
		doctor: `Dr. ${safeField(
			doctorUser?.first_name ? doctorUser.first_name : null
		)} ${safeField(doctorUser?.last_name ? doctorUser.last_name : null)}`,
		role: safeField(roleData?.name),
		notes: safeField(doctor?.notes),
	};
};

export const pdfFormat = (res: Response, data: any[]): PDFKit.PDFDocument => {
	const doc = new PDFDocument({ size: "A4", margin: 50 });

	doc.pipe(res);
	doc
		.fontSize(20)
		.text("Surgery Logs Report", { align: "center" })
		.moveDown(1.5);

	// Loop through each log record with enhanced styling.
	data.forEach((item, index) => {
		// Header for each record.
		doc
			.fontSize(14)
			.fillColor("#000")
			.text(`Surgery ID: ${item.surgeryId}`, { underline: true });
		doc.moveDown(0.5);

		// Basic Info Section
		doc
			.fontSize(12)
			.text(`Lead Surgeon: ${item.leadSurgeon}`)
			.text(`Date: ${item.date}`)
			.text(`Time: ${item.time}`)
			.text(`CPT Code: ${item.cptCode}`)
			.text(`ICD Code: ${item.icdCode}`)
			.moveDown(0.5);

		// Patient Details Section
		doc.font("Helvetica-Bold").text("Patient Details:");
		doc
			.font("Helvetica")
			.list([
				`Patient ID: ${item.patient_details.patient_id}`,
				`BMI: ${item.patient_details.BMI}`,
				`Comorbidity: ${item.patient_details.comorbidity}`,
				`Diagnosis: ${item.patient_details.diagonsis}`,
			]);
		doc.moveDown(0.5);

		// Post Surgery Section
		doc.font("Helvetica-Bold").text("Post Surgery:");
		doc
			.font("Helvetica")
			.list([
				`Surgical Time: ${item.postSurgery.surgicalTime}`,
				`Outcome: ${item.postSurgery.outcome}`,
				`Complications: ${item.postSurgery.complications}`,
				`Discharge Status: ${item.postSurgery.dischargeStatus}`,
				`Discharged At: ${item.postSurgery.discharedAt}`,
				`Case Notes: ${item.postSurgery.caseNotes}`,
			]);
		doc.moveDown(0.5);

		// Team Section
		doc.font("Helvetica-Bold").text("Team:");
		doc.font("Helvetica");
		item.team.forEach((member: any) => {
			doc.text(
				`- ${member.doctor} (${member.role}) | Status: ${member.participationStatus} | Notes: ${member.notes}`
			);
		});
		doc.moveDown(0.5);

		// Draw a horizontal line after each record if not the last record.
		if (index !== data.length - 1) {
			doc
				.moveTo(doc.page.margins.left, doc.y)
				.lineTo(doc.page.width - doc.page.margins.right, doc.y)
				.stroke("#aaaaaa");
			doc.moveDown();
		}

		if (doc.y > doc.page.height - 100 && index !== data.length - 1) {
			doc.addPage();
		}
	});

	return doc;
};

export const excelFormat = async (
	res: Response,
	data: any[]
): Promise<void> => {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("Surgery Logs Report");

	// Define worksheet columns.
	worksheet.columns = [
		{ header: "Surgery ID", key: "surgeryId", width: 15 },
		{ header: "Lead Surgeon", key: "leadSurgeon", width: 25 },
		{ header: "Team", key: "team", width: 40 },
		{ header: "Date", key: "date", width: 12 },
		{ header: "Time", key: "time", width: 10 },
		{ header: "CPT Code", key: "cptCode", width: 15 },
		{ header: "ICD Code", key: "icdCode", width: 15 },
		{ header: "Patient ID", key: "patientId", width: 15 },
		{ header: "BMI", key: "BMI", width: 10 },
		{ header: "Comorbidity", key: "comorbidity", width: 20 },
		{ header: "Diagnosis", key: "diagonsis", width: 25 },
		{ header: "Surgical Time", key: "surgicalTime", width: 15 },
		{ header: "Outcome", key: "outcome", width: 20 },
		{ header: "Complications", key: "complications", width: 25 },
		{ header: "Discharge Status", key: "dischargeStatus", width: 20 },
		{ header: "Discharged At", key: "discharedAt", width: 15 },
		{ header: "Case Notes", key: "caseNotes", width: 30 },
	];

	// Add rows with data.
	data.forEach((item) => {
		worksheet.addRow({
			surgeryId: item.surgeryId,
			leadSurgeon: item.leadSurgeon,
			team: item.team
				.map((doc: any) => `${doc.doctor} (${doc.role})`)
				.join(", "),
			date: item.date,
			time: item.time,
			cptCode: item.cptCode,
			icdCode: item.icdCode,
			patientId: item.patient_details.id,
			BMI: item.patient_details.BMI,
			comorbidity: item.patient_details.comorbidity,
			diagonsis: item.patient_details.diagonsis,
			surgicalTime: item.postSurgery.surgicalTime,
			outcome: item.postSurgery.outcome,
			complications: item.postSurgery.complications,
			dischargeStatus: item.postSurgery.dischargeStatus,
			discharedAt: item.postSurgery.discharedAt,
			caseNotes: item.postSurgery.caseNotes,
		});
	});

	// Style the header row.
	worksheet.getRow(1).eachCell((cell) => {
		cell.font = { bold: true };
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFB0C4DE" },
		};
	});

	// Write Excel workbook to the response.
	res.setHeader(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	);
	res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");
	await workbook.xlsx.write(res);
	res.end();
};
