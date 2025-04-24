import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Paper,
	Alert,
	AlertTitle,
} from "@mui/material";
import axiosClient from "../axiosClient";
import { FormContainer } from "../components/StyledComponents";
import { useStateContext } from "../context/contextprovider";

export default function RequestPage() {
	const query = new URLSearchParams(useLocation().search);
	const id = parseInt(query.get("id"));
	const { user } = useStateContext();
	const consultantId = query.get("consultantId");
	const [loading, setLoading] = useState(true);
	const [rolesData, setRolesData] = useState([]);
	const [error, setError] = useState(null);
	const [redirect, setRedirect] = useState(false);
	const [formData, setFormData] = useState({
		surgeryId: id,
		traineeId: user.id,
		consultantId: consultantId,
		roleId: "",
		notes: "",
	});

	useEffect(() => {
		setLoading(true);
		axiosClient
			.get("/surgical-role", { withCredentials: true })
			.then(({ data }) => {
				setRolesData(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.response?.data?.message || "error fetching data");
			});
	}, []);

	const handleChange = (field) => (event) => {
		setFormData((prev) => ({
			...prev,
			[field]: event.target.value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		axiosClient
			.post("/auth-requests", formData, { withCredentials: true })
			.then(({ data }) => {
				setError(null);
				setRedirect(true);
			})
			.catch((err) => {
				setError(err.response.data.message);
			})
			.finally(() => {
				setLoading(false);
			});
	};
	if (redirect) {
		window.location.href = "/surgeries-open-slots";
	}
	return (
		<FormContainer
			maxWidth="sm"
			sx={{ paddingY: { xs: 2, sm: 4 }, minHeight: "80vh" }}>
			<Paper
				elevation={3}
				sx={{
					padding: { xs: 2, sm: 4 },
					borderRadius: 3,
					boxShadow: 4,
					width: "100%",
				}}>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						<AlertTitle>Error</AlertTitle>
						{error}
					</Alert>
				)}
				<Typography
					variant="h5"
					mb={3}
					sx={{ fontWeight: 600, textAlign: "center" }}>
					Surgery Request Form
				</Typography>

				<Box
					component="form"
					onSubmit={handleSubmit}
					display="flex"
					flexDirection="column"
					gap={3}>
					<FormControl fullWidth required>
						<InputLabel id="role-select-label">Role</InputLabel>
						<Select
							labelId="role-select-label"
							value={formData.roleId}
							label="Role"
							onChange={handleChange("roleId")}>
							{rolesData.map((role) => (
								<MenuItem key={role.id} value={role.id}>
									{role.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<TextField
						label="Notes"
						multiline
						minRows={3}
						fullWidth
						value={formData.notes}
						onChange={handleChange("notes")}
					/>

					<Button
						type="submit"
						variant="contained"
						color="primary"
						size="large"
						loading={loading}>
						Submit Request
					</Button>
				</Box>
			</Paper>
		</FormContainer>
	);
}
