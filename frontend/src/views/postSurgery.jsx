import { useState } from "react";
import {
	Alert,
	AlertTitle,
	Box,
	Button,
	MenuItem,
	Skeleton,
	Typography,
} from "@mui/material";
import {
	FormCard,
	FormContainer,
	FormTextField,
} from "../components/StyledComponents";
import { Navigate, useLocation } from "react-router";
import axiosClient from "../axiosClient";

const OUTCOME = {
	SUCCESS: "success",
	FAILURE: "failure",
};

const DISCHARGE_STATUS = {
	under_observation: "UNDER OBSERVATION",
	discharged: "DISCHARGED",
	transferred: "TRANSFERRED",
	deceased: "DECEASED",
};

export default function PostSurgery() {
	const query = new URLSearchParams(useLocation().search);
	const id = parseInt(query.get("id"));

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [redirect, setRedirect] = useState(false);

	const [formData, setFormData] = useState({
		surgeryId: "",
		surgicalTimeMinutes: "",
		outcome: "",
		complications: "",
		dischargeStatus: "",
		caseNotes: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const payload = {
			surgeryId: Number(id),
			surgicalTimeMinutes: Number(formData.surgicalTimeMinutes),
			outcome: formData.outcome || undefined,
			complications: formData.complications || undefined,
			dischargeStatus: formData.dischargeStatus || undefined,
			caseNotes: formData.caseNotes || undefined,
		};

		setLoading(true);
		axiosClient
			.post("/surgery/post-surgery", payload, { withCredentials: true })
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
	if (loading) {
		return <Skeleton variant="rounded" width="100%" height={600} />;
	}
	if (redirect) {
		return <Navigate to="/surgeries" />;
	}
	return (
		<FormContainer sx={{ minHeight: "90vh" }}>
			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					<AlertTitle>Error</AlertTitle>
					{error}
				</Alert>
			)}
			<FormCard sx={{ minWidth: "80%", mx: "auto", p: 3 }}>
				<Box
					component="form"
					onSubmit={handleSubmit}
					sx={{ maxWidth: 800, mx: "auto" }}>
					<Typography variant="h6" gutterBottom>
						Add Post-Surgery Info
					</Typography>
					<FormTextField
						fullWidth
						label="Surgical Time (minutes)"
						name="surgicalTimeMinutes"
						type="number"
						value={formData.surgicalTimeMinutes}
						onChange={handleChange}
						required
					/>
					<FormTextField
						select
						fullWidth
						label="Outcome"
						name="outcome"
						value={formData.outcome}
						onChange={handleChange}>
						{Object.entries(OUTCOME).map(([key, value]) => (
							<MenuItem key={key} value={value}>
								{value}
							</MenuItem>
						))}
					</FormTextField>
					<FormTextField
						fullWidth
						label="Complications"
						name="complications"
						multiline
						rows={3}
						value={formData.complications}
						onChange={handleChange}
						inputProps={{ maxLength: 1000 }}
					/>
					<FormTextField
						select
						fullWidth
						label="Discharge Status"
						name="dischargeStatus"
						value={formData.dischargeStatus}
						onChange={handleChange}>
						{Object.entries(DISCHARGE_STATUS).map(([key, value]) => (
							<MenuItem key={key} value={key}>
								{value}
							</MenuItem>
						))}
					</FormTextField>
					<FormTextField
						fullWidth
						label="Case Notes"
						name="caseNotes"
						multiline
						rows={4}
						value={formData.caseNotes}
						onChange={handleChange}
						inputProps={{ maxLength: 2000 }}
					/>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						sx={{ mt: 2 }}>
						Submit
					</Button>
				</Box>
			</FormCard>
		</FormContainer>
	);
}
