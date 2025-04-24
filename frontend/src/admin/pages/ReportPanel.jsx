import { useState } from "react";
import {
	Grid2,
	Card,
	CardActionArea,
	CardContent,
	Typography,
	TextField,
	Box,
	CircularProgress,
	Snackbar,
	Alert,
	Container,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GridOnIcon from "@mui/icons-material/GridOn";
import axiosClient from "../../axiosClient";

const ReportsPanel = () => {
	const [startDate, setStartDate] = useState("2025-01-01");
	const [endDate, setEndDate] = useState(
		new Date().toISOString().split("T")[0]
	);
	const [loadingFormat, setLoadingFormat] = useState(null);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const handleExport = async (format) => {
		if (new Date(startDate) > new Date(endDate)) {
			setSnackbar({
				open: true,
				message: "Start date must be before end date.",
				severity: "error",
			});
			return;
		}

		setLoadingFormat(format);
		const url = `/admin/export?format=${format}&startDate=${startDate}&endDate=${endDate}`;

		try {
			const response = await axiosClient.get(url, {
				withCredentials: true,
				responseType: "blob",
			});
			// Axios doesn't include an "ok" property, so check the status instead
			if (response.status < 200 || response.status >= 300) {
				throw new Error("Failed to export logs.");
			}
			const blob = response.data;

			let filename = "";
			if (format === "csv") {
				filename = "report.csv";
			} else if (format === "pdf") {
				filename = "Report.pdf";
			} else if (format === "excel") {
				filename = "report.xlsx";
			}

			const downloadUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();

			setSnackbar({
				open: true,
				message: "Download started!",
				severity: "success",
			});
		} catch (error) {
			setSnackbar({
				open: true,
				message: error.respose.data.message || "Error exporting log",
				severity: "error",
			});
		} finally {
			setLoadingFormat(null);
		}
	};

	const reports = [
		{
			format: "csv",
			label: "CSV Report",
			icon: <DescriptionIcon fontSize="large" />,
		},
		{
			format: "pdf",
			label: "PDF Report",
			icon: <PictureAsPdfIcon fontSize="large" />,
		},
		{
			format: "excel",
			label: "Excel Report",
			icon: <GridOnIcon fontSize="large" />,
		},
	];

	return (
		<Container>
			<Box sx={{ mb: 2, display: "flex", gap: 2, justifyContent: "center" }}>
				<TextField
					label="Start Date"
					type="date"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
				/>
				<TextField
					label="End Date"
					type="date"
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
				/>
			</Box>

			{/* Reports Cards */}
			<Grid2 container spacing={2}>
				{reports.map((report) => (
					<Grid2 item xs={12} sm={4} key={report.format}>
						<Card>
							<CardActionArea
								onClick={() => handleExport(report.format)}
								disabled={loadingFormat !== null}>
								<CardContent
									sx={{
										textAlign: "center",
										position: "relative",
										minHeight: 100,
									}}>
									{loadingFormat === report.format ? (
										<CircularProgress />
									) : (
										report.icon
									)}
									<Typography variant="h6" component="div" sx={{ mt: 1 }}>
										{report.label}
									</Typography>
								</CardContent>
							</CardActionArea>
						</Card>
					</Grid2>
				))}
			</Grid2>

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

export default ReportsPanel;
