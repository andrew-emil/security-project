import { useRef, useState } from "react";
import {
	FormContainer,
	FormCard,
	FormButton,
	FormTextField,
	FormTitle,
} from "../components/StyledComponents";
import { Alert, AlertTitle, Box, Avatar } from "@mui/material";
import axiosClient from "../axiosClient";
import { convertImage } from "./../utils/convertImage";

export default function CreateEquipments() {
	const nameRef = useRef();
	const [isLoading, setIsLoading] = useState(false);
	const [err, setErr] = useState(null);
	const [msg, setMsg] = useState(null);
	const [picture, setPicture] = useState(null);

	const submit = async (ev) => {
		ev.preventDefault();
		setIsLoading(true);
		setErr(null);
		const formData = new FormData();
		formData.append("name", nameRef.current.value);

		if (picture) {
			const base64Image = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result);
				reader.onerror = (error) => reject(error);
				reader.readAsDataURL(picture);
			});

			formData.delete("photo");
			formData.append("photo", base64Image);
		}

		axiosClient
			.post("/surgery-equipments", formData, { withCredentials: true })
			.then(({ data }) => {
				setMsg(data.message);
			})
			.catch((err) => {
				const response = err.response;

				if (response) {
					setErr(response.data.message);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	};
	return (
		<FormContainer>
			<FormCard sx={{ width: "400px", padding: "2rem" }}>
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
				<FormTitle>Create New Equipment</FormTitle>
				<form onSubmit={submit}>
					<FormTextField
						inputRef={nameRef}
						type="text"
						label="Equipment Name"
						variant="outlined"
						fullWidth
						required
					/>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "1rem",
							width: "100%",
						}}>
						<Box sx={{ marginY: "1rem" }}>
							<Avatar
								sx={{ width: 100, height: 100 }}
								src={
									picture
										? URL.createObjectURL(picture)
										: picture?.data
											? convertImage(picture.data)
											: null
								}
							/>
							<input
								id="picture-upload"
								type="file"
								accept="image/*"
								onChange={(e) => {
									setPicture(e.target.files[0]);
								}}
							/>
						</Box>
					</Box>
					<FormButton
						type="submit"
						variant="contained"
						color="primary"
						loading={isLoading}>
						Create Equipment
					</FormButton>
				</form>
			</FormCard>
		</FormContainer>
	);
}
