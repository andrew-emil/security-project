import {
	Avatar,
	Card,
	CardContent,
	Container,
	Skeleton,
	Typography,
	Alert,
	AlertTitle,
} from "@mui/material";
import { useEffect, useState } from "react";
import axiosClient from "./../../axiosClient";
import { Box } from "@mui/material";
import { FormTextField, FormButton } from "../../components/StyledComponents";
import { convertImage } from "./../../utils/convertImage";

const PendingUsers = () => {
	const [pendingUsers, setPendingUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showRejectForm, setShowRejectForm] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");
	const [buttonLoading, setButtonLoading] = useState(false);
	const [msg, setMsg] = useState(null);
	const [err, setErr] = useState(null);

	const handleRejectClick = () => setShowRejectForm(true);
	const handleCancelReject = () => {
		setShowRejectForm(false);
		setRejectionReason("");
	};

	const handleApprove = async (userId, activationToken) => {
		setButtonLoading(true);
		try {
			const response = await axiosClient.patch(
				`/admin/approve-user/${userId}`,
				{},
				{
					withCredentials: true,
					params: {
						activationToken,
					},
				}
			);
			setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
			setMsg(response.data.message);
		} catch (err) {
			setErr(err.data.message);
		} finally {
			setButtonLoading(false);
		}
	};

	const handleReject = async (userId, rejectionReason, activationToken) => {
		setButtonLoading(true);
		try {
			const response = await axiosClient.patch(
				`/admin/reject-user/${userId}`,
				{ rejectionReason },
				{
					withCredentials: true,
					params: {
						activationToken,
					},
				}
			);
			setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
			setMsg(response.data.message);
		} catch (err) {
			setErr(err.data.message);
		} finally {
			setButtonLoading(false);
		}
	};

	useEffect(() => {
		const getPendingUsers = async () => {
			try {
				const response = await axiosClient.get("/admin/pending-users", {
					withCredentials: true,
				});

				setPendingUsers(response.data.data);
				
			} finally {
				setLoading(false);
			}
		};

		getPendingUsers();
	}, []);

	if (loading) {
		return (
			<Container sx={{ marginY: "1rem" }}>
				<Typography variant="h5">Pending Users</Typography>
				<Skeleton variant="rectangular" height={205} sx={{ marginY: "1rem" }} />
				<Skeleton variant="rectangular" height={205} sx={{ marginY: "1rem" }} />
				<Skeleton variant="rectangular" height={205} sx={{ marginY: "1rem" }} />
			</Container>
		);
	}

	return (
		<Container sx={{ marginY: "1rem" }}>
			<Typography variant="h5">Pending Users</Typography>
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
			{pendingUsers.length > 0 ? (
				pendingUsers.map((user) => (
					<Card variant="outlined" sx={{ marginY: "1rem" }} key={user.id}>
						<CardContent>
							<Box
								sx={{
									display: "flex",
									gap: 3,
									alignItems: "flex-start",
									mb: 2,
								}}>
								<Avatar
									src={user.picture ? convertImage(user.picture.data) : null}
									alt={`${user.first_name} ${user.last_name}`}
									style={{
										width: 80,
										height: 80,
										borderRadius: "50%",
										objectFit: "cover",
										border: "2px solid #e0e0e0",
									}}
								/>
							</Box>
							<Typography variant="h6" gutterBottom>
								{user.first_name} {user.last_name}
							</Typography>
							<Typography color="text.secondary">
								Email: {user.email}
							</Typography>
							<Typography color="text.secondary">Role: {user.role}</Typography>
							<Typography color="text.secondary">
								Affiliation: {user.affiliation}
							</Typography>
							<Typography color="text.secondary">
								Department: {user.department}
							</Typography>

							{showRejectForm ? (
								<Box sx={{ mt: 2, gap: "1rem" }}>
									<FormTextField
										fullWidth
										multiline
										rows={3}
										label="Rejection Reason"
										value={rejectionReason}
										onChange={(e) => setRejectionReason(e.target.value)}
										sx={{ mb: 2 }}
									/>
									<FormButton
										variant="contained"
										color="error"
										onClick={() => {
											handleReject(
												user.id,
												rejectionReason,
												user.activation_token
											);
											handleCancelReject();
										}}
										sx={{ margin: 1 }}
										disabled={buttonLoading}>
										Confirm Reject
									</FormButton>
									<FormButton
										variant="outlined"
										onClick={handleCancelReject}
										sx={{ margin: 1 }}>
										Cancel
									</FormButton>
								</Box>
							) : (
								<Box sx={{ display: "flex", gap: 2, mt: 2 }}>
									<FormButton
										variant="contained"
										color="success"
										onClick={() =>
											handleApprove(user.id, user.activation_token)
										}
										disabled={buttonLoading}>
										Approve
									</FormButton>
									<FormButton
										variant="outlined"
										color="error"
										onClick={handleRejectClick}>
										Reject
									</FormButton>
								</Box>
							)}
						</CardContent>
					</Card>
				))
			) : (
				<Typography
					variant="h5"
					component="div"
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						display: "flex",
						width: "auto",
					}}>
					No Pending users!
				</Typography>
			)}
		</Container>
	);
};

export default PendingUsers;
