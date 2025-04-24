import { useEffect, useState, useCallback } from "react";
import {
	Box,
	TextField,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Pagination,
	Container,
	Skeleton,
	Snackbar,
	Alert,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Stack,
} from "@mui/material";
import axiosClient from "../../axiosClient";

const DEFAULT_PAGE = 1;
const ALLOWED_ACTIONS = [
	"Login",
	"Signup",
	"Verify",
	"INSERT",
	"UPDATE",
	"DELETE",
	"Daily cleanup",
];

const AuditTrailTable = () => {
	const [query, setQuery] = useState({
		action: "",
		startDate: "",
		endDate: "",
	});
	const [page, setPage] = useState(DEFAULT_PAGE);
	const [data, setData] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const fetchData = useCallback(async () => {
		const params = new URLSearchParams();
		if (query.action) params.append("action", query.action);
		if (query.startDate) params.append("startDate", query.startDate);
		if (query.endDate) params.append("endDate", query.endDate);
		params.append("page", page);

		try {
			const response = await axiosClient.get(
				`/admin/audit?${params.toString()}`,
				{ withCredentials: true }
			);
			const { data } = response;

			setData(data.results);
			setTotalPages(data.pagination.totalPages);
		} catch (error) {
			setSnackbar({
				open: true,
				message: error.respose?.message || "Error exporting log",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	}, [page, query.action, query.endDate, query.startDate]);

	useEffect(() => {
		if (!query.action || !query.startDate || !query.endDate) return;
		fetchData();
	}, [fetchData, page, query.action, query.endDate, query.startDate]);

	const handleSearch = () => {
		setLoading(true);
		setPage(DEFAULT_PAGE);
		fetchData();
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;

		setQuery((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	if (loading) {
		return (
			<Container>
				<Skeleton height={400} />
			</Container>
		);
	}

	return (
		<Container>
			<Box>
				{/* Search Inputs */}
				<Stack
					direction={{ xs: "column", sm: "row" }} // ← column on mobile, row on sm+
					spacing={2}
					flexWrap="wrap"
					sx={{
						overflowX: "auto",
						margin: "1rem",
						gap: "1rem",
						padding: "1rem",
					}}>
					<FormControl fullWidth sx={{ maxWidth: { sm: 160 } }}>
						<InputLabel id="action-select-label">Action</InputLabel>
						<Select
							sx={{ width: "8rem" }}
							labelId="action-select-label"
							id="action-select"
							name="action"
							value={query.action}
							label="Action"
							onChange={handleInputChange}>
							<MenuItem value="">
								<em>None</em>
							</MenuItem>
							{ALLOWED_ACTIONS.map((action) => (
								<MenuItem key={action} value={action}>
									{action}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<TextField
						label="Start Date"
						name="startDate"
						type="date"
						InputLabelProps={{ shrink: true }}
						value={query.startDate}
						onChange={handleInputChange}
						sx={{ maxWidth: { sm: 180 } }}
					/>
					<TextField
						label="End Date"
						name="endDate"
						type="date"
						InputLabelProps={{ shrink: true }}
						value={query.endDate}
						onChange={handleInputChange}
						sx={{ maxWidth: { sm: 180 } }}
					/>
					<Button
						variant="contained"
						onClick={handleSearch}
						sx={{ maxWidth: { sm: "auto" } }}>
						Search
					</Button>
				</Stack>

				{/* Audit Trail Data Table */}
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Timestamp</TableCell>
								<TableCell>User ID</TableCell>
								<TableCell>Action</TableCell>
								<TableCell>Entity Name</TableCell>
								<TableCell>Entity ID</TableCell>
								<TableCell>IP Address</TableCell>
								<TableCell>User Agent</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data.length > 0 ? (
								data.map((row) => (
									<TableRow key={row.id}>
										<TableCell>
											{new Date(row.timestamp).toLocaleString()}
										</TableCell>
										<TableCell>{row.userId}</TableCell>
										<TableCell>{row.action}</TableCell>
										<TableCell>{row.entityName}</TableCell>
										<TableCell>{row.entityId}</TableCell>
										<TableCell>{row.ipAddress}</TableCell>
										<TableCell>{row.userAgent}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={7} align="center">
										No audit records found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>

				{/* Pagination */}
				<Box display="flex" justifyContent="center" mt={2}>
					<Pagination
						count={totalPages}
						page={page}
						onChange={handlePageChange}
						color="primary"
					/>
				</Box>
			</Box>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={handleCloseSnackbar}>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					sx={{ width: "100%" }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Container>
	);
};

export default AuditTrailTable;
