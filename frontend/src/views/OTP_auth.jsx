import { Typography, Alert, AlertTitle } from "@mui/material";
import { useState } from "react";
import { FormContainer, FormCard } from "../components/StyledComponents";
import { styled } from "@mui/material/styles";
import { FormTitle, FormButton } from "./../components/StyledComponents";
import OTPInput from "./../components/OTPInput";
import axiosClient from "../axiosClient";
import { useStateContext } from "../context/contextprovider";
import { Navigate } from "react-router-dom";

export default function OTP_auth() {
	const [otp, setOtp] = useState("");
	const [err, setErr] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const { setUser, setToken, user } = useStateContext();

	const StyledImg = styled("img")(({ theme }) => ({
		width: 100,
		height: 100,
		borderRadius: "50%",
		objectFit: "contain",
		border: `2px solid ${theme.palette.primary.main}`,
		boxShadow: theme.shadows[2],
		marginBottom: ".5rem",
	}));

	if (!user) {
		
		return <Navigate to="/login" />;
	}

	const submit = (ev) => {
		ev.preventDefault();
		if (otp.length !== 6) {
			setErr("Please enter a valid 6-digit code");
			return;
		}
		setIsLoading(true);
		setErr(null);
		const payload = {
			email: user,
			otp: otp,
		};

		axiosClient
			.post("/users/verify", payload)
			.then(({ data }) => {
				setToken(data.token);
				setUser(data.user);
				
			})
			.catch((err) => {
				const response = err.response;
				if (response) {
					setErr(
						response.data?.message || "Verification failed. Please try again."
					);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	return (
		<FormContainer>
			<FormCard
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					padding: "3rem",
					width: "28rem",
				}}>
				{err && (
					<Alert severity="error" sx={{ marginBottom: "1rem", width: "26rem" }}>
						<AlertTitle>Error</AlertTitle>
						{err}
					</Alert>
				)}
				<StyledImg
					sx={{ marginTop: "2rem" }}
					src="/images/Otp_Icon.svg"></StyledImg>
				<FormTitle>Verfication Code</FormTitle>
				<Typography
					variant="body2"
					className="message"
					sx={{ textAlign: "center", marginBottom: "1rem" }}>
					We have sent a verification code to your email address. Please enter
					the code to verify your account.
				</Typography>
				<form onSubmit={submit} action="">
					<OTPInput otp={otp} setOtp={setOtp}></OTPInput>
					<FormButton
						type="submit"
						variant="contained"
						className="btn btn-black btn-block"
						sx={{ width: "100%", marginTop: "1rem", marginBottom: "2rem" }}
						loading={isLoading}>
						Submit
					</FormButton>
				</form>
			</FormCard>
		</FormContainer>
	);
}
