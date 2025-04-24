import { useState, useEffect } from "react";
import {
	Paper,
	Button,
	Container,
	Skeleton,
	Box,
	IconButton,
	Typography,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import axiosClient from "../axiosClient";
import { useNavigate } from "react-router";

const SurgicalRolePage = () => {
	const [loading, setLoading] = useState(true);
	const [roles, setRoles] = useState([]);
	const [err, setErr] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axiosClient.get("/surgical-role", {
					withCredentials: true,
				});
				const { data } = response;
				setRoles(data);
			} catch (err) {
				console.log(err.response.data.message);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleAddRole = () => navigate("/surgical-roles/add");
	const handleEditRole = (roleId, name) =>
		navigate(`/surgical-roles/edit?id=${roleId}&name=${name}`);
	const handleDeleteRole = async (roleId) => {
		try {
			await axiosClient.delete(`/surgical-role/${roleId}`, {
				withCredentials: true,
			});
			setRoles((prev) => prev.filter((role) => role.id !== roleId));
		} catch (err) {
			setErr(err.response.data.message);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<Container>
				<Skeleton height={400} />
			</Container>
		);
	}

	if (err) {
		return (
			<Container
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					display: "flex",
					width: "auto",
				}}>
				{err && (
					<Typography
						variant="h4"
						sx={{
							marginBottom: "1rem",
							color: "red",
						}}>
						{err}
					</Typography>
				)}
			</Container>
		);
	}

	return (
		<Container maxWidth="lg">
			<Box display="flex" justifyContent="space-between" mb={2} mt={4}>
				<Typography variant="h4">Surgical Role Management</Typography>
				<Button
					variant="contained"
					color="primary"
					startIcon={<Add />}
					onClick={handleAddRole}>
					Add Surgical Role
				</Button>
			</Box>

			<Paper>
				<List>
					{roles.map((role) => (
						<ListItem key={role.id} divider>
							<ListItemText primary={role.name} />
							<ListItemSecondaryAction>
								<IconButton
									edge="end"
									onClick={() => handleEditRole(role.id, role.name)}
									aria-label="edit">
									<Edit color="primary" />
								</IconButton>
								<IconButton
									edge="end"
									onClick={() => handleDeleteRole(role.id)}
									aria-label="delete">
									<Delete color="error" />
								</IconButton>
							</ListItemSecondaryAction>
						</ListItem>
					))}
				</List>
			</Paper>
		</Container>
	);
};

export default SurgicalRolePage;
