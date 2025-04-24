import { LinearProgress, Box, Typography } from "@mui/material";

// eslint-disable-next-line react/prop-types
const RequirementProgress = ({ percentage }) => {
	return (
		<Box sx={{ width: "100%", position: "relative", my: 3 }}>
			<LinearProgress
				variant="determinate"
				value={percentage}
				sx={{
					height: 30,
					borderRadius: 10,
					backgroundColor: "#e9ecef",
					"& .MuiLinearProgress-bar": {
						borderRadius: 10,
						background:
							"linear-gradient(45deg, #3674B5 30%,rgb(96, 169, 248) 90%)",
					},
				}}
			/>
			<Typography
				sx={{
					position: "absolute",
					left: "50%",
					transform: "translate(-50%, -50%)",
					color: "black",
					fontWeight: "bold",
					textShadow: "0 1px 2px rgba(255,255,255,0.5)",
					whiteSpace: "nowrap",

					fontSize: {
						xs: "0.75rem",
						sm: "0.875rem",
						md: "1rem",
						lg: "1.1rem",
					},

					px: {
						xs: 1,
						md: 2,
					},

					top: {
						xs: "48%",
						md: "50%",
					},

					display: {
						xs: "block",
						xxs: "none",
					},
				}}>
				{`${Math.round(percentage)}% Complete`}
			</Typography>
		</Box>
	);
};

export default RequirementProgress;
