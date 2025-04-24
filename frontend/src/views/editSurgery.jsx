import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axiosClient from "../axiosClient";
import { FormTextField } from "../components/StyledComponents";
import {
	Alert,
	AlertTitle,
	Paper,
	Typography,
	Grid,
	TextField,
	Box,
	Button,
	Skeleton,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@mui/material";

const STATUS = {
	COMPLETED: "Completed",
	ONGOING: "Ongoing",
	CANCELLED: "Cancelled",
};

export default function EditSurgery() {
	const query = new URLSearchParams(useLocation().search);
	const id = parseInt(query.get("id"));

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [redirect, setRedirect] = useState(null);
	const [formData, setFormData] = useState({});
	const [affiliation, setAffiliation] = useState(null);
	const [department, setDepartment] = useState(null);
	const [recommendedStaffData, setRecommendedStaffData] = useState([]);
	const [rolesData, setRolesData] = useState([]);
	const [leadSurgeon, setLeadSurgeon] = useState(null);
	const [selectedSurgeons, setSelectedSurgeons] = useState([]);
	const [selectedRoles, setSelectedRoles] = useState([]);
	const [departmentData, setDepartmentData] = useState([]);
	const [affiliationData, setAffiliationData] = useState([]);
	const [notes, setNotes] = useState([]);

	useEffect(() => {
		if (!formData?.metadata?.name) {
			setLoading(true);
			axiosClient
				.get(`/surgery/get-surgrey/${id}`, { withCredentials: true })
				.then((res) => {
					const data = res.data;
					setFormData(data);
					setLoading(false);
					setError(null);

					const hospitalName = data.metadata?.hospital;
					const affiliationObj = affiliationData.find(
						(aff) => aff.name === hospitalName
					);
					if (affiliationObj) {
						setAffiliation(affiliationObj.id);
					}

					const leadSurgeon = data.metadata?.leadSurgeon;
					if (leadSurgeon) {
						setLeadSurgeon(leadSurgeon);
					}
				})
				.catch((error) => {
					setError(error?.response?.data?.message || "Error loading surgery");
					setLoading(false);
				});
		}
	}, [id, affiliationData, departmentData, formData?.metadata?.name]);

	useEffect(() => {
		if (
			affiliation &&
			department &&
			formData.timeline?.date &&
			formData.timeline?.time
		) {
			setLoading(true);
			axiosClient
				.post(
					"/schedule/recommend-staff",
					{
						affiliationId: parseInt(affiliation),
						departmentId: parseInt(department),
						date: formData.timeline?.date,
						time: formData.timeline?.time,
					},
					{ withCredentials: true }
				)
				.then(({ data }) => {
					setRecommendedStaffData(data.recommendedStaff || []);
					setLoading(false);
					setError(null);
				})
				.catch((err) => {
					setError(
						err.response?.message ||
							"Failed to load recommended staff, please make sure that you have selected affiliation and department."
					);
					setLoading(false);
					setRecommendedStaffData([]);
				});
		}
	}, [
		affiliation,
		department,
		formData.timeline?.date,
		formData.timeline?.time,
	]);

	useEffect(() => {
		setLoading(true);
		axiosClient
			.get("/surgical-role", { withCredentials: true })
			.then(({ data }) => {
				setRolesData(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.response.message);
			});
	}, []);

	useEffect(() => {
		setLoading(true);
		axiosClient
			.get("/affiliation")
			.then(({ data }) => {
				setAffiliationData(data.affiliations);
				setLoading(false);
			})
			.catch((err) => {console.log(err.response.data.message)});
	}, []);

	useEffect(() => {
		if (affiliation) {
			axiosClient
				.get(`/departments/${affiliation}`, { withCredentials: true })
				.then(({ data }) => {
					setDepartmentData(data.departments);

					const departmentId = formData.metadata?.department;
					const departmentObj = data.departments.find(
						(dep) => dep.name === departmentId
					);
					if (departmentObj) {
						setDepartment(departmentObj.id);
					}
				})
				.catch((err) => {console.log(err.response.data.message);});
		}
	}, [affiliation]);

	useEffect(() => {
		const team = selectedSurgeons
			.map((surgeon, index) => {
				if (surgeon && selectedRoles[index]) {
					return {
						doctorId: surgeon,
						roleId: selectedRoles[index],
						notes: notes[index] || "",
					};
				}
				return null;
			})
			.filter((item) => item !== null);
		setFormData({
			...formData,
			team: team,
		});
	}, [notes, selectedRoles, selectedSurgeons]);

	const handleChange = (path, value) => {
		const keys = path.split(".");
		const updated = { ...formData };
		let curr = updated;
		for (let i = 0; i < keys.length - 1; i++) {
			curr = curr[keys[i]];
		}
		curr[keys[keys.length - 1]] = value;
		setFormData(updated);
	};

	const handleAffiliationChange = (event) => {
		const selectedAffiliationId = event.target.value;
		setAffiliation(selectedAffiliationId);
		handleChange(
			"metadata.hospital",
			affiliationData.find((aff) => aff.id === selectedAffiliationId)?.id || ""
		);
	};

	const handleDepartmentChange = (event) => {
		const selectedDepartmentId = event.target.value;
		setDepartment(selectedDepartmentId);
		handleChange(
			"metadata.department",
			departmentData.find((dep) => dep.id === selectedDepartmentId)?.id || ""
		);
	};

	const handleStatusChange = (event) => {
		const selectedStatus = event.target.value;
		handleChange("timeline.status", selectedStatus);
	};

	const handleSurgeonChange = (index, event) => {
		const newSurgeons = [...selectedSurgeons];
		newSurgeons[index] = event.target.value;
		setSelectedSurgeons(newSurgeons);
		setFormData({
			...formData,
			team: newSurgeons,
		});
	};

	const handleRoleChange = (index, event) => {
		const newRoles = [...selectedRoles];
		newRoles[index] = event.target.value;
		setSelectedRoles(newRoles);
		setFormData({
			...formData,
			roles: newRoles,
		});
	};

	const handleNotesChange = (index, event) => {
		const newNotes = [...notes];
		newNotes[index] = event.target.value;
		setNotes(newNotes);
	};

	if (loading) {
		return <Skeleton variant="rounded" width="100%" height={600} />;
	}

	const handleSubmit = () => {
		const team = selectedSurgeons
			.map((surgeon, index) => {
				if (surgeon && selectedRoles[index]) {
					return {
						doctorId: surgeon.id,
						roleId: selectedRoles[index].id,
						notes: notes[index] || "",
					};
				}
				return null;
			})
			.filter((item) => item !== null);
		const payload = {
			surgeryId: id,
			hospitalId: parseInt(affiliation),
			departmentId: parseInt(department),
			name: formData.metadata?.name,
			date: formData.timeline?.date,
			time: formData.timeline?.time,
			status: formData.timeline?.status,
			diagnosis: formData.patient?.diagnosis,
			cpt: formData.medicalCodes?.cpt,
			icd: formData.medicalCodes?.icd,
			comorbidity: formData.patient?.comorbidity,
			bmi: formData.patient?.bmi,
			team: team,
		};

		setLoading(true);
		axiosClient
			.put("/surgery", payload, { withCredentials: true })
			.then(({ data }) => {
				setRedirect(true);
			})
			.catch((err) => {
				setError(err.response.message);
			})
			.finally(() => {
				setLoading(false);
			});
	};
	if (redirect) {
		return <Navigate to="/surgeries" />;
	}
	return (
		<Paper sx={{ p: 4 }}>
			<Typography variant="h5" gutterBottom>
				Surgery Form
			</Typography>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					<AlertTitle>Error</AlertTitle>
					{error}
				</Alert>
			)}

			<Grid container spacing={2}>
				<Grid item xs={6}>
					<TextField
						label="Surgery Name"
						fullWidth
						variant="standard"
						value={formData?.metadata?.name || ""}
						onChange={(e) => handleChange("metadata.name", e.target.value)}
					/>
				</Grid>
				<Grid item xs={6}>
					<FormControl variant="standard" sx={{ minWidth: "100%" }}>
						<InputLabel id="demo-simple-select-standard-label">
							Departments
						</InputLabel>
						<Select
							labelId="demo-simple-select-standard-label"
							id="demo-simple-select-standard"
							value={department || ""}
							onChange={handleDepartmentChange}
							label="Department">
							<MenuItem value="" disabled>
								<em>Select Department</em>
							</MenuItem>
							{departmentData.map((dp) => (
								<MenuItem key={dp.id} value={dp.id}>
									{dp.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={6}>
					<FormControl variant="standard" sx={{ minWidth: "100%" }}>
						<InputLabel id="demo-simple-select-standard-label">
							Affiliations
						</InputLabel>
						<Select
							labelId="demo-simple-select-standard-label"
							id="demo-simple-select-standard"
							value={affiliation || ""} // Set the value to the selected affiliation's ID
							onChange={handleAffiliationChange}
							label="Affiliation">
							<MenuItem value="" disabled>
								<em>Select Affiliation</em>
							</MenuItem>
							{affiliationData.map((affiliation) => (
								<MenuItem key={affiliation.id} value={affiliation.id}>
									{affiliation.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={6}>
					<TextField
						label="Lead Surgeon"
						type="text"
						variant="standard"
						fullWidth
						value={leadSurgeon || ""}
						disabled
					/>
				</Grid>
				<Grid item xs={6}>
					<TextField
						label="Date"
						type="date"
						variant="standard"
						fullWidth
						InputLabelProps={{ shrink: true }}
						value={formData?.timeline?.date?.slice(0, 10) || ""}
						onChange={(e) => handleChange("timeline.date", e.target.value)}
					/>
				</Grid>
				<Grid item xs={6}>
					<TextField
						label="Time"
						type="time"
						fullWidth
						variant="standard"
						InputLabelProps={{ shrink: true }}
						value={formData?.timeline?.time || ""}
						onBlur={(e) => handleChange("timeline.time", e.target.value)}
					/>
				</Grid>
				<Grid item xs={6}>
					<FormControl variant="standard" sx={{ minWidth: "100%" }}>
						<InputLabel id="status-select-label">Status</InputLabel>
						<Select
							labelId="status-select-label"
							id="status-select"
							value={formData?.timeline?.status || ""}
							onChange={handleStatusChange}
							label="Status">
							<MenuItem value={STATUS.COMPLETED}>{STATUS.COMPLETED}</MenuItem>
							<MenuItem value={STATUS.ONGOING}>{STATUS.ONGOING}</MenuItem>
							<MenuItem value={STATUS.CANCELLED}>{STATUS.CANCELLED}</MenuItem>
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={6}>
					<TextField
						label="Diagnosis"
						fullWidth
						variant="standard"
						value={formData?.patient?.diagnosis || ""}
						onChange={(e) => handleChange("patient.diagnosis", e.target.value)}
					/>
				</Grid>
				<Grid item xs={6}>
					<TextField
						label="CPT Code"
						fullWidth
						variant="standard"
						value={formData?.medicalCodes?.cpt || ""}
						onChange={(e) => handleChange("medicalCodes.cpt", e.target.value)}
					/>
				</Grid>
				<Grid item xs={6}>
					<TextField
						label="ICD Code"
						variant="standard"
						fullWidth
						value={formData?.medicalCodes?.icd || ""}
						onChange={(e) => handleChange("medicalCodes.icd", e.target.value)}
					/>
				</Grid>
				<Grid item xs={6}>
					<TextField
						label="comorbidity"
						variant="standard"
						fullWidth
						value={formData?.patient?.comorbidity || ""}
						onChange={(e) =>
							handleChange("patient.comorbidity", e.target.value.split(","))
						}
					/>
				</Grid>
				<Grid item xs={6}>
					<TextField
						label="bmi"
						variant="standard"
						fullWidth
						value={formData?.patient?.bmi || ""}
						onChange={(e) => handleChange("patient.bmi", e.target.value)}
					/>
				</Grid>
			</Grid>

			{/* Surgical Team Display */}
			<Box mt={4}>
				<Typography variant="h6" gutterBottom>
					Surgical Team
				</Typography>
				{formData.team && formData.team.length > 0 ? (
					formData.team.map((teamMember, index) => (
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
								{/* Display Team Member */}
								<TextField
									label="Name"
									fullWidth
									variant="standard"
									value={
										teamMember.name ||
										"Dr/ " +
											formData.team[index]?.doctorId?.firstName +
											" " +
											formData.team[index]?.doctorId?.lastName ||
										""
									}
									disabled
								/>
								<TextField
									label="Hospital Role"
									fullWidth
									variant="standard"
									value={
										teamMember.hospitalRole ||
										formData.team[index]?.doctorId?.expertise ||
										""
									}
									disabled
								/>
								<TextField
									label="Surgical Role"
									fullWidth
									variant="standard"
									value={
										teamMember.surgicalRole ||
										formData.team[index]?.roleId?.name ||
										""
									}
									disabled
								/>
							</Box>
						</Box>
					))
				) : (
					<Typography variant="body2" color="textSecondary">
						No surgical team members assigned.
					</Typography>
				)}
				<Typography sx={{ marginTop: "2rem" }} variant="h6" gutterBottom>
					Recommended Staff
				</Typography>
				{Array.from({ length: formData.slots }).map((_, index) => (
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
								<InputLabel id={`demo-simple-select-standard-label-${index}`}>
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
										<MenuItem key={Surgeon.id} value={Surgeon}>
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
								<InputLabel id={`role-select-label-${index}`}>Role</InputLabel>
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
										<MenuItem key={role.id} value={role}>
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

			<Box mt={4}>
				<Button variant="contained" color="primary" onClick={handleSubmit}>
					Submit
				</Button>
			</Box>
		</Paper>
	);
}
