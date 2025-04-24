import { useRef, useState } from "react";
import {
	FormCard,
	FormContainer,
	FormTextField,
	FormButton,
	FormTitle,
} from "../components/StyledComponents";
import { Alert, AlertTitle } from "@mui/material";
import axiosClient from "../axiosClient";

const AddSurgicalRole = () => {
	const nameRef = useRef();
	const [err, setErr] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [msg, setMsg] = useState(null);

	const submit = async (ev) => {
		ev.preventDefault();
		setIsLoading(true);
		setErr(null);
		setMsg(null);
		const payload = {
			name: nameRef.current.value,
		};

		try {
			const response = await axiosClient.post("/surgical-role", payload, {
				withCredentials: true,
			});

			const { data } = response;
			setMsg(data.message);
		} catch (err) {
			console.error(err);
			setErr(err.response.data.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<FormContainer>
			<FormCard>
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
				<FormTitle>Add Surgical Role</FormTitle>
				<form onSubmit={submit}>
					<FormTextField
						inputRef={nameRef}
						type="text"
						label="Surgical role Name"
						variant="outlined"
						fullWidth
						required
					/>

					<FormButton
						type="submit"
						variant="contained"
						color="primary"
						loading={isLoading}>
						Add Surgical Role
					</FormButton>
				</form>
			</FormCard>
		</FormContainer>
	);
};

export default AddSurgicalRole;
