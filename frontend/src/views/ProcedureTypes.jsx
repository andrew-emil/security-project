import { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	Container,
	Skeleton,
	Box,
	IconButton,
	Typography,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import axiosClient from "../axiosClient";
import { useNavigate } from "react-router";

const ProcedureTypePage = () => {
	const [loading, setLoading] = useState(true);
	const [Procedure, setProcedure] = useState([]);
	const [err, setErr] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axiosClient.get("/procedure-types", {
					withCredentials: true,
				});
				const { data } = response;
				setProcedure(data);
			} catch (err) {
				console.log(err.response.data.message);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleAdd = () => navigate("/procedure-types/add");
	const handleEdit = (id, name, category) =>
		navigate(`/procedure-types/edit`, {
			state: {
				procedure: {
					id,
					name,
					category,
				},
			},
		});
	const handleDelete = async (id) => {
		try {
			await axiosClient.delete(`/procedure-types/${id}`, {
				withCredentials: true,
			});
			setProcedure((prev) => prev.filter((proc) => proc.id !== id));
		} catch (err) {
			setErr(err.response.data.message);
		} finally {
			setLoading(false);
		}
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
				<Typography variant="h4">Procedure Types</Typography>
				<Button
					variant="contained"
					color="primary"
					startIcon={<Add />}
					onClick={handleAdd}>
					Add
				</Button>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Category</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{Procedure.map((proc) => (
							<TableRow key={proc.id}>
								<TableCell>{proc.name}</TableCell>
								<TableCell>{proc.category || "N/A"}</TableCell>

								<TableCell align="right">
									<IconButton
										onClick={() =>
											handleEdit(proc.id, proc.name, proc.category)
										}>
										<Edit color="primary" />
									</IconButton>
									<IconButton onClick={() => handleDelete(proc.id)}>
										<Delete color="error" />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Container>
	);
};

export default ProcedureTypePage;
