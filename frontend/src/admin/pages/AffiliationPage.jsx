import {
	Typography,
	Container,
	Skeleton,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import { useState, useEffect } from "react";
import axiosClient from "./../../axiosClient";
import PropTypes from "prop-types";
const AffiliationPage = ({
	navigate,
	selectedAffiliationId,
	setSelectedAffiliationId,
}) => {
	const [affiliations, setAffiliations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axiosClient.get("affiliation", {
					withCredentials: true,
				});

				const { data } = response;
				setAffiliations(data.affiliations);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleDeleteConfirm = async () => {
		try {
			await axiosClient.delete(`affiliation/${selectedAffiliationId}`, {
				withCredentials: true,
			});
			setAffiliations((prev) =>
				prev.filter((affiliation) => affiliation.id !== selectedAffiliationId)
			);
			setSelectedAffiliationId(null);
		} catch (error) {
			console.error("Failed to delete affiliation:", error);
		} finally {
			setOpenDeleteDialog(false);
		}
	};

	if (loading) {
		return (
			<Container>
				<Skeleton variant="rounded" height={300} />
			</Container>
		);
	}

	return (
		<Container>
			<Typography variant="h4" gutterBottom>
				Affiliations
			</Typography>
			<div style={{ marginBottom: 16 }}>
				<Button
					variant="contained"
					onClick={() => navigate("/create-affiliation")}
					sx={{ mb: 2, mr: 2 }}>
					Add Affiliation
				</Button>
				<Button
					variant="outlined"
					onClick={() => navigate("/affiliation-details")}
					disabled={!selectedAffiliationId}
					sx={{ mb: 2, mr: 2 }}>
					affiliation details
				</Button>
				<Button
					variant="outlined"
					onClick={() => navigate(`/affiliations/edit`)}
					disabled={!selectedAffiliationId}
					sx={{ mb: 2, mr: 2 }}>
					Edit
				</Button>
				<Button
					variant="outlined"
					color="error"
					onClick={() => setOpenDeleteDialog(true)}
					disabled={!selectedAffiliationId}
					sx={{ mb: 2 }}>
					Delete
				</Button>
			</div>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>City</TableCell>
							<TableCell>Country</TableCell>
							<TableCell>Address</TableCell>
							<TableCell>Institution Type</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{affiliations.map((affiliation) => (
							<TableRow
								key={affiliation.id}
								onClick={() => {
									setSelectedAffiliationId(affiliation.id);
								}}
								selected={selectedAffiliationId === affiliation.id}
								hover
								sx={{ cursor: "pointer" }}>
								<TableCell>{affiliation.name}</TableCell>
								<TableCell>{affiliation.city}</TableCell>
								<TableCell>{affiliation.country}</TableCell>
								<TableCell>{affiliation.address}</TableCell>
								<TableCell>{affiliation.institution_type}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Dialog
				open={openDeleteDialog}
				onClose={() => setOpenDeleteDialog(false)}>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					Are you sure you want to delete this affiliation?
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
					<Button onClick={handleDeleteConfirm} color="error" autoFocus>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

AffiliationPage.propTypes = {
	navigate: PropTypes.func.isRequired,
	selectedAffiliationId: PropTypes.string,
	setSelectedAffiliationId: PropTypes.func.isRequired,
};

export default AffiliationPage;
