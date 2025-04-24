import React, { useEffect, useState } from "react";
import {
	Container,
	Skeleton,
	AlertTitle,
	Alert,
	Paper,
	Typography,
	Grid2,
	List,
	ListItem,
	ListItemText,
	Divider,
	Chip,
	Box,
	Stack,
	Rating,
	Avatar,
	ListItemAvatar,
	Tooltip,
	Button,
} from "@mui/material";
import { FormTextField, FormButton } from "../components/StyledComponents";
import { useLocation } from "react-router-dom";
import axiosClient from "../axiosClient";
import {
	CheckCircle,
	Person,
	MedicalInformation,
	AccessTime,
	MonitorHeart,
	Star,
	MedicalServices,
} from "@mui/icons-material";
import { useStateContext } from "../context/contextprovider";
import { convertImage } from "./../utils/convertImage";

const SurgeryDetails = () => {
	const location = useLocation();
	const { surgeryId } = location.state;
	const [surgeryData, setSurgeryData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState(null);
	const { user } = useStateContext();
	const [isAuthorizedToRate, setIsAuthorizedToRate] = useState(false);

	// New rating form state
	const [newRatingStars, setNewRatingStars] = useState(0);
	const [newRatingComment, setNewRatingComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState(null);

	// Editing state for existing ratings
	const [editingRatingId, setEditingRatingId] = useState(null);
	const [editingRatingStars, setEditingRatingStars] = useState(0);
	const [editingRatingComment, setEditingRatingComment] = useState("");

	// Fetch surgery data
	useEffect(() => {
		const fetchSurgeryData = async () => {
			try {
				const { data } = await axiosClient.get(
					`/surgery/get-surgrey/${surgeryId}`,
					{ withCredentials: true }
				);
				setSurgeryData(data);
			} catch (error) {
				console.error(error);
				setErr(error.message);
			}
		};
		fetchSurgeryData();
	}, [surgeryId]);

	// Determine user authorization once data is loaded
	useEffect(() => {
		if (surgeryData) {
			let authorized =
				user && surgeryData.team.some((member) => member.id === user.id);
			// Allow if user name matches lead surgeon
			if (!authorized && user?.name === surgeryData.metadata.leadSurgeon) {
				authorized = true;
			}
			setIsAuthorizedToRate(authorized);
			setLoading(false);
		}
	}, [surgeryData, user]);

	if (loading) {
		return (
			<Container>
				<Skeleton variant="rectangular" height={500} sx={{ marginY: "1rem" }} />
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
				<Alert severity="error" sx={{ marginBottom: "1rem", width: 150 }}>
					<AlertTitle>Error</AlertTitle>
					{err}
				</Alert>
			</Container>
		);
	}

	const updateRatingsState = (updatedBreakdown) => {
		const totalStars = updatedBreakdown.reduce((sum, r) => sum + r.stars, 0);
		const count = updatedBreakdown.length;
		const average = count > 0 ? totalStars / count : 0;
		setSurgeryData((prev) => ({
			...prev,
			ratings: {
				...prev.ratings,
				breakdown: updatedBreakdown,
				average,
				count,
			},
		}));
	};

	const handleRatingSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setFormError(null);
		try {
			const payload = {
				surgeryId,
				stars: newRatingStars,
				comment: newRatingComment.trim(),
			};
			const { data: responseData } = await axiosClient.post(
				"/rating",
				payload,
				{ withCredentials: true }
			);
			const newRating = responseData.data;
			updateRatingsState([...surgeryData.ratings.breakdown, newRating]);
			setNewRatingStars(0);
			setNewRatingComment("");
		} catch (error) {
			setFormError(error.response?.data?.message || "Failed to submit rating");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditRating = (review) => {
		setEditingRatingId(review.id);
		setEditingRatingStars(review.stars);
		setEditingRatingComment(review.comment);
	};

	const cancelEditing = () => {
		setEditingRatingId(null);
	};

	const handleUpdateRating = async (e, ratingId) => {
		e.preventDefault();
		try {
			const { data: responseData } = await axiosClient.patch(
				`/rating/${ratingId}`,
				{
					stars: editingRatingStars,
					comment: editingRatingComment,
				},
				{ withCredentials: true }
			);
			const updatedRating = responseData.data;
			const updatedBreakdown = surgeryData.ratings.breakdown.map((r) =>
				r.id === ratingId ? updatedRating : r
			);
			updateRatingsState(updatedBreakdown);
			setEditingRatingId(null);
		} catch (error) {
			console.error(error);
		}
	};

	const handleDeleteRating = async (ratingId) => {
		try {
			await axiosClient.delete(`/rating/${ratingId}`, {
				withCredentials: true,
			});
			const updatedBreakdown = surgeryData.ratings.breakdown.filter(
				(r) => r.id !== ratingId
			);
			updateRatingsState(updatedBreakdown);
		} catch (error) {
			console.error(error);
		}
	};

	// Render an individual rating review
	const renderRatingReview = (review, index) => {
		const isEditing = editingRatingId === review.id;
		const isUserReview = user && review.user && review.user.id === user.id;
		return (
			<React.Fragment key={review.id}>
				<ListItem alignItems="flex-start">
					<ListItemAvatar>
						<Avatar
							src={
								review.user?.picture?.data
									? convertImage(review.user.picture.data)
									: null
							}>
							{review.user ? review.user.name.split(" ")[1][0] : <Person />}
						</Avatar>
					</ListItemAvatar>
					<ListItemText
						primary={
							<>
								<Rating
									value={review.stars}
									precision={0.5}
									readOnly
									size="small"
								/>
								<Typography
									component="span"
									variant="body2"
									color="text.secondary"
									sx={{ display: "flex" }}>
									{review.user?.name || "Anonymous"}
								</Typography>
							</>
						}
						secondary={
							<>
								{isEditing ? (
									<form onSubmit={(e) => handleUpdateRating(e, review.id)}>
										<Box sx={{ mt: 1 }}>
											<Stack spacing={2}>
												<Rating
													name="edit-rating"
													value={editingRatingStars}
													precision={0.5}
													onChange={(e, newValue) =>
														setEditingRatingStars(newValue)
													}
												/>
												<FormTextField
													label="Comment"
													variant="outlined"
													fullWidth
													multiline
													rows={2}
													value={editingRatingComment}
													onChange={(e) =>
														setEditingRatingComment(e.target.value)
													}
												/>
												<Box sx={{ display: "flex", gap: 1 }}>
													<Button type="submit" variant="contained">
														Save
													</Button>
													<Button variant="outlined" onClick={cancelEditing}>
														Cancel
													</Button>
												</Box>
											</Stack>
										</Box>
									</form>
								) : (
									<>
										<Typography
											component="span"
											variant="body2"
											color="text.primary">
											{review.comment}
										</Typography>
										{isUserReview && (
											<Box sx={{ mt: 1 }}>
												<Button
													variant="outlined"
													size="small"
													onClick={() => handleEditRating(review)}
													sx={{ mr: 1 }}>
													Update
												</Button>
												<Button
													variant="outlined"
													size="small"
													color="error"
													onClick={() => handleDeleteRating(review.id)}>
													Delete
												</Button>
											</Box>
										)}
									</>
								)}
								<Typography
									component="div"
									variant="caption"
									color="text.secondary">
									{new Date(review.createdAt).toLocaleDateString()}
								</Typography>
							</>
						}
					/>
				</ListItem>
				{index < surgeryData.ratings.breakdown.length - 1 && <Divider />}
			</React.Fragment>
		);
	};

	return (
		<Container>
			<Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
				<Typography variant="h5" gutterBottom>
					{surgeryData.metadata.name}
					<Chip
						icon={<CheckCircle />}
						label={surgeryData.timeline.status}
						color="success"
						sx={{ ml: 2 }}
					/>
				</Typography>
				{/* Metadata Section */}
				<Box mb={3}>
					<Grid2 container spacing={3}>
						<Grid2 item md={6}>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Hospital:</strong> {surgeryData.metadata.hospital}
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Department:</strong> {surgeryData.metadata.department}
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Lead Surgeon:</strong> Dr.{" "}
								{surgeryData.metadata.leadSurgeon}
							</Typography>
						</Grid2>
						<Grid2 item md={6}>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Equipment:</strong>
							</Typography>
							<Stack direction="row" spacing={1}>
								<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
									{surgeryData.metadata.surgeryEquipments.map((equipment) => (
										<Tooltip
											key={equipment.id}
											title={equipment.equipment_name}
											arrow>
											<Chip
												sx={{
													height: 60,
													borderRadius: 1,
													borderColor: "divider",
													"& .MuiChip-avatar": {
														width: 48,
														height: 48,
														bgcolor: "primary.light",
													},
												}}
												avatar={
													<Avatar
														src={
															equipment.photo?.data
																? convertImage(equipment.photo.data)
																: null
														}>
														<MedicalServices />
													</Avatar>
												}
												label={
													<Box
														sx={{
															maxWidth: 120,
															whiteSpace: "nowrap",
															overflow: "hidden",
															textOverflow: "ellipsis",
														}}>
														{equipment.equipment_name}
													</Box>
												}
												variant="outlined"
											/>
										</Tooltip>
									))}
								</Box>
							</Stack>
						</Grid2>
					</Grid2>
				</Box>
				<Divider sx={{ my: 2 }} />
				{/* Timeline */}
				<Box mb={3}>
					<Typography variant="h6" gutterBottom>
						<AccessTime sx={{ verticalAlign: "middle", mr: 1 }} />
						Schedule
					</Typography>
					<Grid2 container spacing={3}>
						<Grid2 item xs={4}>
							<Typography>
								<strong>Date:</strong> {surgeryData.timeline.date.split("T")[0]}
							</Typography>
						</Grid2>
						<Grid2 item xs={4}>
							<Typography>
								<strong>Time:</strong> {surgeryData.timeline.time}
							</Typography>
						</Grid2>
						<Grid2 item xs={4}>
							<Typography>
								<strong>Duration:</strong>{" "}
								{surgeryData.outcomes?.duration || "-"} mins
							</Typography>
						</Grid2>
					</Grid2>
				</Box>
				<Divider sx={{ my: 2 }} />
				{/* Medical Codes */}
				<Box mb={3}>
					<Typography variant="h6" gutterBottom>
						<MedicalInformation sx={{ verticalAlign: "middle", mr: 1 }} />
						Medical Codes
					</Typography>
					<Grid2 container spacing={3}>
						<Grid2 item xs={6}>
							<Typography>
								<strong>CPT:</strong> {surgeryData.medicalCodes.cpt}
							</Typography>
						</Grid2>
						<Grid2 item xs={6}>
							<Typography>
								<strong>ICD:</strong> {surgeryData.medicalCodes.icd}
							</Typography>
						</Grid2>
					</Grid2>
				</Box>
				<Divider sx={{ my: 2 }} />
				{/* Team Section */}
				<Box mb={3}>
					<Typography variant="h6" gutterBottom>
						<Person sx={{ verticalAlign: "middle", mr: 1 }} />
						Surgical Team
					</Typography>
					<List dense>
						{surgeryData.team.map((member) => (
							<ListItem key={member.id}>
								<ListItemText
									primary={member.name}
									secondary={member.surgicalRole}
								/>
							</ListItem>
						))}
					</List>
				</Box>
				<Divider sx={{ my: 2 }} />
				{/* Patient Outcomes */}
				<Box mb={3}>
					<Typography variant="h6" gutterBottom>
						<MonitorHeart sx={{ verticalAlign: "middle", mr: 1 }} />
						Patient & Outcomes
					</Typography>
					<Grid2 container spacing={3}>
						<Grid2 item xs={4}>
							<Typography>
								<strong>BMI:</strong> {surgeryData.patient.bmi}
							</Typography>
							<Typography>
								<strong>Comorbidity:</strong>{" "}
								{surgeryData.patient.comorbidity.join(", ")}
							</Typography>
						</Grid2>
						<Grid2 item xs={4}>
							<Typography>
								<strong>Diagnosis:</strong> {surgeryData.patient.diagnosis}
							</Typography>
						</Grid2>
						<Grid2 item xs={4}>
							<Typography>
								<strong>Discharge Status:</strong>{" "}
								{surgeryData.outcomes?.dischargeStatus.replace("_", " ") || "-"}
							</Typography>
							<Typography>
								<strong>Result:</strong> {surgeryData.outcomes?.result || "-"}
							</Typography>
						</Grid2>
					</Grid2>
				</Box>
				<Divider sx={{ my: 2 }} />
				{/* Ratings & Reviews */}

				<Box mt={3}>
					<Typography variant="h6" gutterBottom>
						<Star sx={{ verticalAlign: "middle", mr: 1 }} />
						Ratings & Reviews
					</Typography>

					<Grid2 container spacing={3} alignItems="center" mb={3}>
						<Grid2 item>
							<Typography variant="h2" component="div">
								{surgeryData.ratings?.average.toFixed(1) || "0"}
							</Typography>
						</Grid2>
						<Grid2 item>
							<Rating
								value={surgeryData.ratings?.average || "0"}
								precision={0.5}
								readOnly
								size="large"
							/>
							<Typography variant="body2" color="text.secondary">
								{surgeryData.ratings?.count || "0"} reviews
							</Typography>
						</Grid2>
					</Grid2>
					{surgeryData.ratings?.breakdown.length > 0 && surgeryData.ratings? (
						<List>
							{surgeryData.ratings.breakdown.map((review, index) =>
								renderRatingReview(review, index)
							)}
						</List>
					) : (
						<Typography variant="body2" color="text.secondary">
							No reviews yet
						</Typography>
					)}
				</Box>
				{/* New Rating Form */}
				<form onSubmit={handleRatingSubmit}>
					<Box mt={3}>
						<Typography variant="h6" gutterBottom>
							Add Your Rating
						</Typography>
						{!isAuthorizedToRate && (
							<Alert severity="warning" sx={{ marginY: "1rem" }}>
								You are not authorized to add a rating for this surgery.
							</Alert>
						)}
						<Stack spacing={2}>
							<Rating
								name="new-rating"
								value={newRatingStars}
								precision={0.5}
								onChange={(e, newValue) => setNewRatingStars(newValue)}
								disabled={!isAuthorizedToRate}
							/>
							<FormTextField
								label="Comment"
								variant="outlined"
								fullWidth
								multiline
								rows={3}
								value={newRatingComment}
								onChange={(e) => setNewRatingComment(e.target.value)}
								disabled={!isAuthorizedToRate}
							/>
							{formError && <Alert severity="error">{formError}</Alert>}
							<FormButton
								variant="contained"
								type="submit"
								disabled={
									!isAuthorizedToRate || isSubmitting || newRatingStars === 0
								}>
								{isSubmitting ? "Submitting..." : "Submit Rating"}
							</FormButton>
						</Stack>
					</Box>
				</form>
			</Paper>
		</Container>
	);
};

export default SurgeryDetails;
