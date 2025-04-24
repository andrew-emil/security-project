import {
	Container,
	Skeleton,
	Card,
	CardContent,
	Typography,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Button,
	Divider,
	Chip,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Rating,
	Alert,
	AlertTitle,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axiosClient from "./../../axiosClient";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const AffiliationDetails = ({ affiliationId }) => {
	const navigate = useNavigate();
	const [affiliation, setAffiliation] = useState(null);
	const [loading, setLoading] = useState(true);
	const [buttonLoading, setButtonLoading] = useState(false);
	const [teams, setTeams] = useState([]);
	const [err, setErr] = useState(null);
	const [msg, setMsg] = useState(null);

	useEffect(() => {
		if (affiliationId) {
			const fetchAllData = async () => {
				try {
					const [affiliationResponse, performanceResponse] = await Promise.all([
						axiosClient.get(`affiliation/${affiliationId}`, {
							withCredentials: true,
						}),
						axiosClient.get(
							`admin/dashboard/team-performance/${affiliationId}`,
							{
								withCredentials: true,
							}
						),
					]);

					setAffiliation(affiliationResponse.data);
					setTeams(performanceResponse.data.teams);
				} catch (err) {
					setErr(err.response.data.message);
				} finally {
					setLoading(false);
				}
			};
			fetchAllData();
		}
	}, [affiliationId]);

	const handleAddDepartment = () => {
		navigate(`/admin/add-department?id=${affiliationId}`);
	};

	const handleUpdateDepartment = (department) => {
		navigate(`/admin/edit-department`, {
			state: {
				department,
			},
		});
	};

	const handleDeleteDepartment = async (departmentId) => {
		setButtonLoading(true);
		setMsg(null);
		setErr(null);
		try {
			await axiosClient.delete(`/departments/${departmentId}`, {
				withCredentials: true,
			});
			const departments = affiliation.departments.filter(
				(depart) => depart.id === departmentId
			);
			setAffiliation((prev) => ({ ...prev, departments }));
			setMsg("department deleted successfully");
		} catch (err) {
			setErr(err.response.data.message);
		} finally {
			setButtonLoading(false);
		}
	};

	if (loading || !affiliation) {
		return (
			<Container sx={{ mt: 4 }}>
				<Skeleton variant="rounded" height={400} />
				<Skeleton variant="rounded" height={300} sx={{ mt: 2 }} />
			</Container>
		);
	}

	return (
		<Container sx={{ marginY: "1rem" }}>
			<Card elevation={3} sx={{ mb: 4 }}>
				{err && (
					<Alert severity="error" sx={{ marginBottom: "1rem" }}>
						<AlertTitle>Error</AlertTitle>
						{err}
					</Alert>
				)}
				{msg && (
					<Alert severity="success" sx={{ marginBottom: "1rem" }}>
						<AlertTitle>Success</AlertTitle>
						{msg}
					</Alert>
				)}
				<CardContent>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}>
						<Typography variant="h4" gutterBottom>
							{affiliation.name}
						</Typography>
						<Chip
							label={affiliation.institution_type}
							color="primary"
							variant="outlined"
						/>
					</Box>

					<Divider sx={{ my: 2 }} />

					<Typography variant="body1" gutterBottom>
						{affiliation.address}
					</Typography>
					<Typography variant="body1" gutterBottom>
						{affiliation.city}, {affiliation.country}
					</Typography>

					<Divider sx={{ my: 2 }} />

					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}>
						<Typography variant="h6">Departments</Typography>
						<Button
							variant="outlined"
							startIcon={<Add />}
							onClick={handleAddDepartment}
							disabled={buttonLoading}>
							Add Department
						</Button>
					</Box>

					<List>
						{affiliation.departments?.map((department) => (
							<ListItem
								key={department.id}
								secondaryAction={
									<>
										<IconButton
											edge="end"
											aria-label="edit"
											onClick={() => handleUpdateDepartment(department)}
											sx={{ mr: 1 }}
											disabled={buttonLoading}>
											<Edit />
										</IconButton>
										<IconButton
											edge="end"
											aria-label="delete"
											onClick={() => handleDeleteDepartment(department.id)}
											disabled={buttonLoading}>
											<Delete sx={{ color: "red" }} />
										</IconButton>
									</>
								}>
								<ListItemText primary={department.name} />
							</ListItem>
						))}
					</List>
				</CardContent>
			</Card>

			{/* Team Performance Section */}
			<Card elevation={3}>
				<CardContent>
					<Typography variant="h5" gutterBottom>
						Team Performance Metrics
					</Typography>

					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Doctor Name</TableCell>
									<TableCell align="right">Average Surgeries</TableCell>
									<TableCell align="right">Average Rating</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{teams.map((team) => (
									<TableRow key={team.doctorName}>
										<TableCell>{team.doctorName}</TableCell>
										<TableCell align="right">
											{team.avg_surgeries ? team.avg_surgeries : "N/A"}
										</TableCell>
										<TableCell align="right">
											<Typography variant="h5">
												{team.avg_rating ? team.avg_rating : "N/A"}
											</Typography>
											<Rating
												value={team.avg_rating || 0}
												precision={0.5}
												readOnly
												size="large"
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					{teams.length === 0 && (
						<Typography variant="body1" sx={{ mt: 2, textAlign: "center" }}>
							No performance data available
						</Typography>
					)}
				</CardContent>
			</Card>
		</Container>
	);
};

AffiliationDetails.propTypes = {
	affiliationId: PropTypes.string,
};

export default AffiliationDetails;
