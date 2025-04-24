import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axiosClient from "./../axiosClient";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Container,
	Skeleton,
	Box,
	Typography,
} from "@mui/material";

const RoleManagmentPage = () => {
	const [loading, setLoading] = useState(true);
	const [roles, setRoles] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axiosClient.get("roles", {
					withCredentials: true,
				});
				const { data } = response;

				setRoles(data.data);
			} catch (err) {
				console.error(err.response.data.message);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleRowClick = (roleId) => {
		navigate(`/role-assign/${roleId}`);
	};

	if (loading) {
		return (
			<Container>
				{Array(5)
					.fill(0)
					.map((_, index) => (
						<TableRow key={index}>
							<TableCell>
								<Skeleton variant="text" />
							</TableCell>
							<TableCell>
								<Skeleton variant="text" />
							</TableCell>
							<TableCell>
								<Skeleton variant="text" />
							</TableCell>
							<TableCell>
								<Skeleton variant="text" width="60%" />
								<Skeleton variant="text" width="40%" />
							</TableCell>
							<TableCell>
								<Skeleton variant="circular" width={40} height={40} />
								<Skeleton variant="circular" width={40} height={40} />
							</TableCell>
						</TableRow>
					))}
			</Container>
		);
	}

	return (
		<Container maxWidth="lg">
			<Box display="flex" justifyContent="space-between" mb={2} mt={4}>
				<Typography variant="h4">Roles Management</Typography>
			</Box>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Parent</TableCell>
							<TableCell>Requirements</TableCell>
							<TableCell>permissions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{roles.map((role) => (
							<TableRow
								key={role.id}
								onClick={() => handleRowClick(role.id)}
								sx={{
									"&:hover": {
										backgroundColor: "action.hover",
										cursor: "pointer",
									},
								}}>
								<TableCell>{role.name}</TableCell>
								<TableCell>{role.parent?.name || "N/A"}</TableCell>
								<TableCell>
									{role.requirements?.map((req) => (
										<div key={req.id}>
											{req.procedure.name} ({req.procedure.category}) -
											Required: {req.requiredCount}
										</div>
									))}
								</TableCell>
								<TableCell>
									{role.permissions?.map((perm) => (
										<div key={perm.id}>{perm.action}</div>
									))}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Container>
	);
};

export default RoleManagmentPage;
