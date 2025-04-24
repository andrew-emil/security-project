import * as React from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";
import { useEffect, useRef, useState } from "react";
import { FormContainer, FormTextField } from "../components/StyledComponents";
import axiosClient from "../axiosClient";
import AlertTitle from "@mui/material/AlertTitle";
import {
	Alert,
	Box,
	Skeleton,
	InputLabel,
	Select,
	MenuItem,
	FormControl,
	Checkbox,
	ListItemText,
	Typography,
	Card,
	CardContent,
	Divider,
	Grid,
	List,
	ListItem,
} from "@mui/material";

const steps = ["Surgery Details", "Surgery Team", "Review Surgery"];

let payload = {};

// eslint-disable-next-line react/prop-types
function StepOne({ onComplete }) {
	const nameRef = useRef();
	const slotRef = useRef();
	const dateRef = useRef();
	const timeRef = useRef();
	const estimatedEndTimeRef = useRef();
	const cptCodeRef = useRef();
	const icdCodeRef = useRef();
	const patientBmiRef = useRef();
	const patientComorbidityRef = useRef();
	const patientDiagnosisRef = useRef();

	const [err, setErr] = useState(null);
	const [msg, setMsg] = useState(null);
	const [loading, setLoading] = useState(true);
	const [affiliation, setAffiliation] = useState(null);
	const [department, setDepartment] = useState("");
	const [equipment, setEquipment] = useState([]);
	const [procedure, setProcedure] = useState([]);
	const [affiliationData, setAffiliationData] = useState([]);
	const [patientComorbidityData, setPatientComorbidityData] = useState([]);
	const [procedureTypeData, setProcedureTypeData] = useState([]);
	const [departmentData, setDepartmentData] = useState([]);
	const [equipmentData, setEquipmentData] = useState([]);

	useEffect(() => {
		setLoading(true);
		axiosClient
			.get("/affiliation")
			.then(({ data }) => {
				setAffiliationData(data.affiliations);
				setLoading(false);
			})
			.catch((err) => {console.log(err.response.data.message);});
	}, []);
	useEffect(() => {
		setLoading(true);
		axiosClient
			.get("/surgery-equipments", { withCredentials: true })
			.then(({ data }) => {
				setEquipmentData(data.equipments);
				setLoading(false);
			})
			.catch((err) => {console.log(err.response.data.message);});
	}, []);
	useEffect(() => {
		setLoading(true);
		axiosClient
			.get("/procedure-types", { withCredentials: true })
			.then(({ data }) => {
				setProcedureTypeData(data);
				setLoading(false);
			})
			.catch((err) => {console.log(err.response.data.message);});
	}, []);

	useEffect(() => {
		if (affiliation) {
			axiosClient
				.get(`/departments/${affiliation}`, { withCredentials: true })
				.then(({ data }) => {
					setDepartmentData(data.departments);
				})
				.catch((err) => {console.log(err.response.data.message);});
		}
	}, [affiliation]);

	if (loading) {
		return (
			<FormContainer>
				<Skeleton variant="rounded" width={720} height={526} />
			</FormContainer>
		);
	}

	const validateFields = () => {
		const newErrors = {};
		if (!nameRef.current.value) newErrors.name = "Name is required";
		if (!slotRef.current.value) newErrors.slots = "Slots are required";
		if (!dateRef.current.value) newErrors.date = "Date is required";
		if (!timeRef.current.value) newErrors.time = "Time is required";
		if (!estimatedEndTimeRef.current.value)
			newErrors.estimatedEndTime = "Estimated end time is required";
		if (!cptCodeRef.current.value) newErrors.cptCode = "CPT Code is required";
		if (!icdCodeRef.current.value) newErrors.icdCode = "ICD Code is required";
		if (!affiliation) newErrors.affiliation = "Affiliation is required";
		if (!department) newErrors.department = "Department is required";
		if (!procedure) newErrors.procedure = "Procedure is required";

		setErr(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const collectPayload = () => {
		if (!validateFields()) return;

		payload = {
			name: nameRef.current.value,
			slots: slotRef.current.value,
			date: dateRef.current.value,
			time: timeRef.current.value,
			estimatedEndTime: estimatedEndTimeRef.current.value,
			cptCode: cptCodeRef.current.value,
			icdCode: icdCodeRef.current.value,
			patientBmi: patientBmiRef.current.value,
			patientDiagnosis: patientDiagnosisRef.current.value,
			patientComorbidity: patientComorbidityData,
			affiliation,
			department,
			equipment,
			procedure,
		};
		onComplete();
	};

	const handleAffiliationChange = (event) => {
		setAffiliation(event.target.value);
	};
	const handleDepartmentChange = (event) => {
		setDepartment(event.target.value);
	};
	const handleProcedureChange = (event) => {
		setProcedure(event.target.value);
	};
	const handleEquipmentChange = (event) => {
		const {
			target: { value },
		} = event;

		const parsed =
			typeof value === "string"
				? value.split(",").map((v) => parseInt(v))
				: value.map((v) => parseInt(v));

		setEquipment(parsed);
	};

	const handlePatientComorbidityChange = (ev) => {
		ev.preventDefault();
		const comorbidityArray = patientComorbidityRef.current.value.split(",");
		setPatientComorbidityData(comorbidityArray);
	};

	return (
		<FormContainer
			sx={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "70%",
				minHeight: "70%",
			}}>
			{err && (
				<Alert severity="error" sx={{ marginBottom: "1rem" }}>
					<AlertTitle>Error</AlertTitle>
					{Object.values(err).join(", ")}
				</Alert>
			)}
			{msg && (
				<Alert severity="success" sx={{ marginBottom: "1rem" }}>
					<AlertTitle>Success</AlertTitle>
					{msg}
				</Alert>
			)}
			<form style={{ width: "100%" }}>
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", sm: "row" },
						gap: "1rem",
					}}>
					<Box sx={{ width: { xs: "100%", sm: "50%" } }}>
						<FormTextField
							inputRef={nameRef}
							type="name"
							label="Name"
							variant="standard"
							required
						/>
						<FormTextField
							inputRef={slotRef}
							type="number"
							label="Slots"
							variant="standard"
							required
						/>
						<FormTextField
							inputRef={dateRef}
							type="date"
							label="Date"
							variant="standard"
							required
							InputLabelProps={{
								shrink: true,
							}}
						/>
						<FormTextField
							inputRef={timeRef}
							type="time"
							label="Time"
							variant="standard"
							required
							InputLabelProps={{
								shrink: true,
							}}
						/>
						<FormTextField
							inputRef={estimatedEndTimeRef}
							type="time"
							label="Estimated End Time"
							variant="standard"
							required
							InputLabelProps={{
								shrink: true,
							}}
						/>
						<FormTextField
							inputRef={cptCodeRef}
							type="text"
							label="CPT Code"
							variant="standard"
							required
						/>
						<FormTextField
							inputRef={icdCodeRef}
							type="text"
							label="ICD Code"
							variant="standard"
							required
						/>
					</Box>
					<Box sx={{ width: { xs: "100%", sm: "50%" } }}>
						<FormControl variant="standard" sx={{ minWidth: "100%" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Affiliations
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={affiliation}
								onChange={handleAffiliationChange}
								label="Affiliation">
								<MenuItem value="">
									<em>None</em>
								</MenuItem>
								{affiliationData.map((affiliation) => (
									<MenuItem key={affiliation.id} value={affiliation.id}>
										{affiliation.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<FormControl
							variant="standard"
							sx={{ minWidth: "100%", marginTop: "1rem" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Departments
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={department}
								onChange={handleDepartmentChange}
								label="Department"
								disabled={departmentData.length === 0}>
								<MenuItem value="">
									<em>None</em>
								</MenuItem>
								{departmentData.length > 0 ? (
									departmentData.map((department) => (
										<MenuItem key={department.id} value={department.id}>
											{department.name}
										</MenuItem>
									))
								) : (
									<MenuItem></MenuItem>
								)}
							</Select>
						</FormControl>
						<FormControl
							variant="standard"
							sx={{ minWidth: "100%", marginTop: "1rem" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Procedure Type
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={procedure}
								onChange={handleProcedureChange}
								label="Procedure Type">
								<MenuItem value="">
									<em>None</em>
								</MenuItem>
								{procedureTypeData.length > 0 ? (
									procedureTypeData.map((procedure) => (
										<MenuItem key={procedure.id} value={procedure.id}>
											{procedure.name}
										</MenuItem>
									))
								) : (
									<MenuItem></MenuItem>
								)}
							</Select>
						</FormControl>
						<FormControl
							variant="standard"
							sx={{
								minWidth: "100%",
								marginTop: "1rem",
								marginBottom: "1rem",
							}}>
							<InputLabel id="demo-multiple-checkbox-label">
								Equipments
							</InputLabel>
							<Select
								labelId="demo-multiple-checkbox-label"
								id="demo-multiple-checkbox"
								multiple
								value={equipment}
								onChange={handleEquipmentChange}
								renderValue={(selected) => selected.join(", ")}
								label="Equipment">
								<MenuItem value="">
									<em>None</em>
								</MenuItem>
								{equipmentData.length > 0 ? (
									equipmentData.map((eq) => (
										<MenuItem key={eq.id} value={eq.id}>
											<Checkbox
												checked={equipment.includes(eq.equipment_name)}
											/>
											<ListItemText primary={eq.equipment_name} />
										</MenuItem>
									))
								) : (
									<MenuItem></MenuItem>
								)}
							</Select>
						</FormControl>
						<FormTextField
							inputRef={patientBmiRef}
							type="number"
							label="Patient BMI"
							variant="standard"
						/>
						<FormTextField
							inputRef={patientDiagnosisRef}
							type="text"
							label="Patient Diagnosis"
							variant="standard"
						/>
						<FormTextField
							inputRef={patientComorbidityRef}
							onBlur={handlePatientComorbidityChange}
							type="text"
							label="Patient Comorbidity"
							placeholder="Example: Hypertension, Diabetes"
							variant="standard"
							InputLabelProps={{
								shrink: true,
							}}
						/>
					</Box>
				</Box>
			</form>
			<Button variant="contained" sx={{ mt: 3 }} onClick={collectPayload}>
				Complete Step
			</Button>
		</FormContainer>
	);
}

// eslint-disable-next-line react/prop-types
function StepTwo({ onComplete }) {
	const [err, setErr] = useState(null);
	const [loading, setLoading] = useState(false);
	const [leadSurgeon, setLeadSurgeon] = useState(null);
	const [recommendedStaffData, setRecommendedStaffData] = useState([]);
	const [rolesData, setRolesData] = useState([]);

	// Maintain separate state for each selected staff, role, and notes
	const [selectedSurgeons, setSelectedSurgeons] = useState([]);
	const [selectedRoles, setSelectedRoles] = useState([]);
	const [notes, setNotes] = useState([]); // New state for notes

	useEffect(() => {
		setLoading(true);
		axiosClient
			.post(
				"/schedule/recommend-staff",
				{
					affiliationId: payload["affiliation"],
					departmentId: payload["department"],
					date: payload["date"],
					time: payload["time"],
				},
				{ withCredentials: true }
			)
			.then(({ data }) => {
				setRecommendedStaffData(data.recommendedStaff);
				setLoading(false);
			})
			.catch((err) => {
				setErr(err.response.message);
			});
	}, []);

	useEffect(() => {
		setLoading(true);
		axiosClient
			.get("/surgical-role", { withCredentials: true })
			.then(({ data }) => {
				setRolesData(data);
				setLoading(false);
			})
			.catch((err) => {console.log(err.response.data.message);});
	}, []);

	if (loading) {
		return (
			<FormContainer>
				<Skeleton variant="rounded" width={720} height={526} />
			</FormContainer>
		);
	}

	const handleSurgeonChange = (index, event) => {
		const newSurgeons = [...selectedSurgeons];
		newSurgeons[index] = event.target.value;
		setSelectedSurgeons(newSurgeons);
	};

	const handleRoleChange = (index, event) => {
		const newRoles = [...selectedRoles];
		newRoles[index] = event.target.value;
		setSelectedRoles(newRoles);
	};

	const handleNotesChange = (index, event) => {
		const newNotes = [...notes];
		newNotes[index] = event.target.value; // Update the specific index for notes
		setNotes(newNotes);
	};

	const validateFields = () => {
		const newErrors = {};
		if (!leadSurgeon) newErrors.name = "Name is required";
		setErr(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const collectPayload = () => {
		if (!validateFields()) return;

		const team = selectedSurgeons
			.map((surgeon, index) => {
				if (surgeon && selectedRoles[index]) {
					return {
						doctorId: surgeon,
						roleId: selectedRoles[index],
						notes: notes[index] || "", // Include notes for each surgeon
					};
				}
				return null;
			})
			.filter((item) => item !== null);

		payload = {
			hospitalId: payload["affiliation"],
			departmentId: payload["department"],
			name: payload["name"],
			leadSurgeon: leadSurgeon,
			procedureTypeId: payload["procedure"],
			doctorsTeam: team,
			slots: parseInt(payload["slots"]),
			date: payload["date"],
			time: payload["time"],
			estimatedEndTime: payload["estimatedEndTime"],
			surgeryEquipments: payload["equipment"],
			cptCode: payload["cptCode"],
			icdCode: payload["icdCode"],
			patientBmi: parseInt(payload["patientBmi"]),
			patientComorbidity: payload["patientComorbidity"],
			patientDiagnosis: payload["patientDiagnosis"],
		};

		onComplete();
	};

	return (
		<FormContainer
			sx={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "70%",
				minHeight: "70%",
			}}>
			{err && (
				<Alert severity="error" sx={{ marginBottom: "1rem" }}>
					<AlertTitle>Error</AlertTitle>
					{Object.values(err).join(", ")}
				</Alert>
			)}

			<form style={{ width: "100%" }}>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
					<Box sx={{ width: "100%" }}>
						<FormControl variant="standard" sx={{ minWidth: "100%" }}>
							<InputLabel id="demo-simple-select-standard-label">
								Lead Surgeon
							</InputLabel>
							<Select
								labelId="demo-simple-select-standard-label"
								id="demo-simple-select-standard"
								value={leadSurgeon}
								onChange={(event) => setLeadSurgeon(event.target.value)}
								label="Lead Surgeon">
								<MenuItem value="">
									<em>None</em>
								</MenuItem>
								{recommendedStaffData.map((Surgeon) => (
									<MenuItem key={Surgeon.id} value={Surgeon.id}>
										{Surgeon.firstName +
											" " +
											Surgeon.lastName +
											"|" +
											Surgeon.expertise}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>

					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							gap: "1rem",
							width: "calc(100% - 1rem)",
						}}>
						{Array.from({ length: payload["slots"] }).map((_, index) => (
							<Box
								key={index}
								sx={{
									width: "100%",
									display: "flex",
									flexDirection: "column",
									gap: "1rem",
								}}>
								<Box
									sx={{
										display: "flex",
										flexDirection: "row",
										width: "50%",
										gap: "1rem",
									}}>
									<FormControl variant="standard" sx={{ minWidth: "100%" }}>
										<InputLabel
											id={`demo-simple-select-standard-label-${index}`}>
											Recommended Staff
										</InputLabel>
										<Select
											labelId={`demo-simple-select-standard-label-${index}`}
											id={`demo-simple-select-standard-${index}`}
											value={selectedSurgeons[index] || ""}
											onChange={(event) => handleSurgeonChange(index, event)}
											label="Recommended Staff">
											<MenuItem value="">
												<em>None</em>
											</MenuItem>
											{recommendedStaffData.map((Surgeon) => (
												<MenuItem key={Surgeon.id} value={Surgeon.id}>
													{Surgeon.firstName +
														" " +
														Surgeon.lastName +
														"|" +
														Surgeon.expertise}
												</MenuItem>
											))}
										</Select>
									</FormControl>

									<FormControl variant="standard" sx={{ minWidth: "100%" }}>
										<InputLabel id={`role-select-label-${index}`}>
											Role
										</InputLabel>
										<Select
											labelId={`role-select-label-${index}`}
											id={`role-select-${index}`}
											value={selectedRoles[index] || ""}
											onChange={(event) => handleRoleChange(index, event)}
											label="Role">
											<MenuItem value="">
												<em>None</em>
											</MenuItem>
											{rolesData.map((role) => (
												<MenuItem key={role.id} value={role.id}>
													{role.name}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Box>
								{/* Add Notes Field */}
								<FormControl variant="standard" sx={{ minWidth: "100%" }}>
									<FormTextField
										label="Notes"
										value={notes[index] || ""}
										onChange={(event) => handleNotesChange(index, event)}
										multiline
										rows={3}
										variant="outlined"
									/>
								</FormControl>
							</Box>
						))}
					</Box>
				</Box>
			</form>

			<Button variant="contained" sx={{ mt: 3 }} onClick={collectPayload}>
				Complete Step
			</Button>
		</FormContainer>
	);
}

function StepThree() {
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState(null);
	const [redirect, setRedirect] = useState(false);
	const {
		name,
		leadSurgeon,
		procedureTypeId,
		hospitalId,
		departmentId,
		date,
		time,
		estimatedEndTime,
		doctorsTeam,
		slots,
		surgeryEquipments,
		cptCode,
		icdCode,
		patientBmi,
		patientComorbidity,
		patientDiagnosis,
	} = payload;

	const confirmSurgery = () => {
		setLoading(true);
		axiosClient
			.post("/surgery", payload, { withCredentials: true })
			.then(({ data }) => {
				setRedirect(true);
			})
			.catch((err) => {
				setErr(err.response.message);
			})
			.finally(() => {
				setLoading(false);
			});
	};
	if (redirect) {
		window.location.href = "/surgeries";
	}

	return (
		<Box sx={{ width: "100%", p: 3 }}>
			{err && (
				<Alert severity="error" sx={{ marginBottom: "1rem" }}>
					<AlertTitle>Error</AlertTitle>
					{Object.values(err).join(", ")}
				</Alert>
			)}
			<Typography variant="h5" gutterBottom>
				Review Surgery Details
			</Typography>

			<Card variant="outlined" sx={{ mb: 2 }}>
				<CardContent>
					<Typography variant="h6">Basic Information</Typography>
					<Divider sx={{ mb: 2 }} />
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<Typography>
								<strong>Name:</strong> {name}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography>
								<strong>Lead Surgeon ID:</strong> {leadSurgeon}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography>
								<strong>Procedure ID:</strong> {procedureTypeId}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography>
								<strong>Hospital ID:</strong> {hospitalId}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography>
								<strong>Department ID:</strong> {departmentId}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography>
								<strong>Slots:</strong> {slots}
							</Typography>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			<Card variant="outlined" sx={{ mb: 2 }}>
				<CardContent>
					<Typography variant="h6">Timing</Typography>
					<Divider sx={{ mb: 2 }} />
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<Typography>
								<strong>Date:</strong> {date}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography>
								<strong>Time:</strong> {time}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography>
								<strong>Estimated End Time:</strong> {estimatedEndTime}
							</Typography>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			<Card variant="outlined" sx={{ mb: 2 }}>
				<CardContent>
					<Typography variant="h6">Doctors Team</Typography>
					<Divider sx={{ mb: 2 }} />
					<List>
						{doctorsTeam.map((member, index) => (
							<ListItem key={index} alignItems="flex-start">
								<ListItemText
									primary={`Doctor ID: ${member.doctorId}`}
									secondary={
										<>
											<Typography component="span" variant="body2">
												Role ID: {member.roleId}
											</Typography>
											<br />
											Notes: {member.notes}
										</>
									}
								/>
							</ListItem>
						))}
					</List>
				</CardContent>
			</Card>

			<Card variant="outlined" sx={{ mb: 2 }}>
				<CardContent>
					<Typography variant="h6">Surgery Equipments</Typography>
					<Divider sx={{ mb: 2 }} />
					<List>
						{surgeryEquipments.map((item, index) => (
							<ListItem key={index}>
								<ListItemText primary={item} />
							</ListItem>
						))}
					</List>
				</CardContent>
			</Card>

			<Card variant="outlined" sx={{ mb: 2 }}>
				<CardContent>
					<Typography variant="h6">Medical Information</Typography>
					<Divider sx={{ mb: 2 }} />
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<Typography>
								<strong>CPT Code:</strong> {cptCode}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography>
								<strong>ICD Code:</strong> {icdCode}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography>
								<strong>Patient BMI:</strong> {patientBmi}
							</Typography>
						</Grid>
						<Grid item xs={12}>
							<Typography>
								<strong>Patient Comorbidities:</strong>
							</Typography>
							<List dense>
								{patientComorbidity.map((com, index) => (
									<ListItem key={index}>
										<ListItemText primary={com} />
									</ListItem>
								))}
							</List>
						</Grid>
						<Grid item xs={12}>
							<Typography>
								<strong>Diagnosis:</strong> {patientDiagnosis}
							</Typography>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
			<Button
				loading={loading}
				variant="contained"
				sx={{ mt: 3 }}
				onClick={confirmSurgery}>
				Confirm Surgery
			</Button>
		</Box>
	);
}

export default function HorizontalNonLinearStepper() {
	const [activeStep, setActiveStep] = React.useState(0);
	const [completed, setCompleted] = React.useState({});

	const totalSteps = () => {
		return steps.length;
	};

	const completedSteps = () => {
		return Object.keys(completed).length;
	};

	const isLastStep = () => {
		return activeStep === totalSteps() - 1;
	};

	const allStepsCompleted = () => {
		return completedSteps() === totalSteps();
	};

	const handleNext = () => {
		const newActiveStep =
			isLastStep() && !allStepsCompleted()
				? steps.findIndex((step, i) => !(i in completed))
				: activeStep + 1;
		setActiveStep(newActiveStep);
	};

	const handleBack = () => {
		setActiveStep(activeStep - 1);
	};

	const handleStep = (step) => () => {
		setActiveStep(step);
	};

	const handleComplete = () => {
		setCompleted({ ...completed, [activeStep]: true });
		handleNext();
	};

	const handleReset = () => {
		setActiveStep(0);
		setCompleted({});
	};

	return (
		<Box sx={{ width: "100%" }}>
			<Stepper activeStep={activeStep} alternativeLabel>
				{steps.map((label, index) => (
					<Step key={label}>
						<StepButton onClick={handleStep(index)}>{label}</StepButton>
					</Step>
				))}
			</Stepper>
			<Box
				sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
				{activeStep === 0 && <StepOne onComplete={handleComplete} />}
				{activeStep === 1 && <StepTwo onComplete={handleComplete} />}
				{activeStep === 2 && <StepThree />}

				<Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
					<Button
						disabled={activeStep === 0}
						onClick={handleBack}
						sx={{ width: "auto", marginTop: "1rem" }}>
						Back
					</Button>
					<Button
						disabled={activeStep === 0 || activeStep === 2}
						onClick={handleReset}
						sx={{ width: "auto", marginTop: "1rem" }}>
						Reset
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
