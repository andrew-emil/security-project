import { useRef, useState } from "react";
import axiosClient from "../axiosClient";
import {
	FormContainer,
	FormCard,
	FormTitle,
	FormTextField,
	FormButton,
} from "../components/StyledComponents";
import { Alert, AlertTitle, Box, Button } from "@mui/material";
import { Navigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

export default function ResetPassword() {
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get("token");
	const email = urlParams.get("email");
	const passwordRef = useRef();
	const confirmPasswordRef = useRef();
	const [message, setMessage] = useState();
	const [err, setErr] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const submit = (ev) => {
		ev.preventDefault();

		if (passwordRef.current.value !== confirmPasswordRef.current.value) {
			setErr("Passwords do not match.");
			return;
		}

		setIsLoading(true);
		const payload = {
			email,
			token,
			newPassword: passwordRef.current.value,
		};

		axiosClient
			.post("/users/reset-password", payload)
			.then(({ data }) => {
				setMessage(data.message);
			})
			.catch((err) => {
				const response = err.response;

				if (response) {
					setErr(response.data.message);
				}
			})
			.finally(() => setIsLoading(false));
	};

	if (!token) {
		return <Navigate to="/not-found"></Navigate>;
	}
	return (
		<FormContainer>
			<FormCard>
				{err && (
					<Alert severity="error" sx={{ marginBottom: "1rem" }}>
						<AlertTitle>Error</AlertTitle>
						{err}
					</Alert>
				)}
				{message && (
					<Box>
						<Alert severity="success" sx={{ marginBottom: "1rem" }}>
							<AlertTitle>Success</AlertTitle>
							{message}
						</Alert>
						<Button variant="contained" component={RouterLink} to="/login">
							Go To Login Page
						</Button>
					</Box>
				)}

				<FormTitle className="title">Reset Password</FormTitle>
				<form onSubmit={submit}>
					<FormTextField
						inputRef={passwordRef}
						type="password"
						name=""
						id="standard-basic"
						label="Enter New Password"
						variant="standard"
						required
					/>
					<FormTextField
						inputRef={confirmPasswordRef}
						type="password"
						name=""
						id="standard-basic"
						label="Confirm New Password"
						variant="standard"
						required
					/>
					<FormButton
						type="submit"
						variant="contained"
						className="btn btn-black btn-block"
						loading={isLoading}>
						Submit
					</FormButton>
				</form>
			</FormCard>
		</FormContainer>
	);
}
