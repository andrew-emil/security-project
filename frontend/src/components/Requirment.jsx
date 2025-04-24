import { Box, Card, CardContent, Typography } from "@mui/material";

// eslint-disable-next-line react/prop-types
const Requirments = ({ requirments }) => {
	
	return (
		<Box sx={{ width: "100%" }}>
			{/* eslint-disable-next-line react/prop-types */}
			{requirments.map((requirment) => (
				<Card key={requirment.procedureId}>
					<CardContent>
						<Typography sx={{ fontWeight: "bold" }} variant="h4">
							{requirment.procedureName}
						</Typography>
						<Typography variant="h5">{`Category: ${requirment.category}`}</Typography>
						<Typography variant="h5">{`completed: ${requirment.completed}/${requirment.required}`}</Typography>
					</CardContent>
				</Card>
			))}
		</Box>
	);
};

export default Requirments;
