import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";

import { FormContainer, FormButton } from "../components/StyledComponents";
import { Box, Card, CardContent, Typography, Divider } from "@mui/material";

export default function RequestManagment() {
	const [loading, setLoading] = useState(true);
	const [surgeries, setUserSurgeries] = useState([]);
	const [err, setErr] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axiosClient.get("/surgery/surgeries", {
					withCredentials: true,
				});
				const { data } = response;
				setUserSurgeries(data.surgeries);
			} catch (err) {
				setErr(err.response?.data?.message || "error fetching surgeries");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);
	const handleRequestClick = (data) => {
		window.location.href = `/surgery-requests-management/all-requests?id=${data.id}`;
	};
	return (
		<FormContainer
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "95vh",
				gap: 2,
				py: 4,
			}}>
			{surgeries.map((item, index) => (
				<Card
					key={index}
					sx={{
						width: "100%",
						borderRadius: 3,
						boxShadow: 3,
						padding: 2,
					}}>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							{item.name}
						</Typography>
						<Divider sx={{ mb: 2 }} />
						<Box
							display="flex"
							flexWrap="wrap"
							justifyContent="space-between"
							gap={2}>
							<Typography>
								<strong>Date:</strong>{" "}
								{new Date(item.date).toLocaleDateString()}
							</Typography>
							<Typography>
								<strong>Time:</strong> {item.time}
							</Typography>
							<Typography>
								<strong>Stars:</strong> {item.stars}
							</Typography>
							<Typography>
								<strong>ICD Code:</strong> {item.icdCode}
							</Typography>
							<Typography>
								<strong>CPT Code:</strong> {item.cptCode}
							</Typography>
							<Box sx={{}}>
								<FormButton
									type="button"
									variant="contained"
									className="btn btn-black btn-block"
									onClick={() => handleRequestClick(item)}>
									Get All Requests
								</FormButton>
							</Box>
						</Box>
					</CardContent>
				</Card>
			))}
		</FormContainer>
	);
}
