import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { useLocation } from "react-router";
import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Container,
	Divider,
	Typography,
} from "@mui/material";
import { FormButton } from "../components/StyledComponents";
import { useStateContext } from "../context/contextprovider";

export default function RequestsForSurgery() {
	const query = new URLSearchParams(useLocation().search);
	const id = parseInt(query.get("id"));
	const [loading, setLoading] = useState(true);
	const [requests, setRequests] = useState([]);
	const [surgeries, setSurguries] = useState([]);
	const [msg, setMsg] = useState(null);
	const { user } = useStateContext();

	const [err, setErr] = useState(null);
	useEffect(() => {
		setLoading(true);
		const fetchData = async () => {
			try {
				const response = await axiosClient.get(`/auth-requests/${id}/request`, {
					withCredentials: true,
				});
				const { data } = response;
				setRequests(data.requests);
				setSurguries(data.surgery);
			} catch (err) {
				setErr(err.response.data.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);
	const handleApprove = (req) => {
		axiosClient
			.put(`/auth-requests/${req.id}/approve`, {
				withCredentials: true,
			})
			.then((response) => {
				setMsg(response.data.message);
				setRequests((prev) => prev.filter((r) => r.id !== req.id));
			})
			.catch((err) => {
				setErr(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	};
	const handleReject = (req) => {
		axiosClient
			.put(`/auth-requests/${req.id}/reject`, {
				withCredentials: true,
			})
			.then((response) => {
				setMsg(response.data.message);
				setRequests((prev) => prev.filter((r) => r.id !== req.id));
			})
			.catch((err) => {
				setErr(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	};
	return (
		<Container sx={{ py: 4, display: "flex", flexDirection: "column", gap: 4 }}>
			{msg && (
				<Box bgcolor="success.light" p={2} borderRadius={2} textAlign="center">
					<Typography color="success.main">{msg}</Typography>
				</Box>
			)}

			{err && (
				<Box bgcolor="error" p={2} borderRadius={2} textAlign="center">
					<Typography color="error.main">
						No requests for this surgery
					</Typography>
				</Box>
			)}
			{requests.map((request, index) => (
				<Card
					key={request.id}
					sx={{ width: "100%", borderRadius: 3, boxShadow: 3 }}>
					<CardHeader
						title={`Request #${index + 1}`}
						subheader={`Status: ${request.status}`}
						titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
						subheaderTypographyProps={{ color: "text.secondary" }}
					/>
					<Divider />
					<CardContent>
						<Typography variant="subtitle1" gutterBottom>
							Created At: {new Date(request.created_at).toLocaleString()}
						</Typography>

						{request.approvedAt && (
							<Typography variant="subtitle1" color="success.main">
								Approved At: {new Date(request.approvedAt).toLocaleString()}
							</Typography>
						)}

						{request.rejectionReason && (
							<Typography variant="subtitle1" color="error">
								Rejection Reason: {request.rejectionReason}
							</Typography>
						)}

						<Divider sx={{ my: 2 }} />

						<Box
							display="flex"
							gap={4}
							flexWrap="wrap"
							justifyContent="space-between">
							<Box id="surgery-info" display={"flex"} gap={3}>
								<Box>
									<Typography variant="h6" gutterBottom>
										Trainee Info
									</Typography>
									<Typography>
										Name: {request.trainee?.first_name}{" "}
										{request.trainee?.last_name}
									</Typography>
									<Typography>Email: {request.trainee?.email}</Typography>
									<Typography>
										Phone: {request.trainee?.phone_number}
									</Typography>
								</Box>
								<Box>
									<Typography variant="h6" gutterBottom>
										Consultant Info
									</Typography>
									<Typography>
										Name: {request.consultant.first_name}{" "}
										{request.consultant.last_name}
									</Typography>
									<Typography>Email: {request.consultant.email}</Typography>
									<Typography>
										Phone: {request.consultant.phone_number}
									</Typography>
								</Box>
							</Box>

							<Box
								alignSelf={"flex-end"}
								display="flex"
								flexDirection="column"
								gap={2}>
								<FormButton
									type="button"
									variant="contained"
									className="btn btn-black btn-block"
									onClick={() => handleApprove(request)}
									disabled={user.id !== request.consultant.id}>
									Approve
								</FormButton>
								<FormButton
									type="button"
									variant="contained"
									className="btn btn-black btn-block"
									onClick={() => handleReject(request)}
									disabled={user.id !== request.consultant.id}>
									Reject
								</FormButton>
							</Box>
						</Box>
					</CardContent>
				</Card>
			))}
		</Container>
	);
}
