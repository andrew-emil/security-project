import {
	FormCard,
	FormContainer,
	FormTitle,
	FormTextField,
	FormButton,
} from "../../components/StyledComponents";
import { Alert, AlertTitle } from "@mui/material";
import { useRef } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import axiosClient from "../../axiosClient";

const AddDepartment = () => {
	const [err, setErr] = useState(null);
	const [msg, setMsg] = useState(null);
	const [loading, setLoading] = useState(false);
	const nameRef = useRef();
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const affiliationId = searchParams.get("id");

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setErr(null);
		setMsg(null);
		try {
			const payload = {
				affiliationId,
				name: nameRef.current.value,
			};
			const response = await axiosClient.post("departments", payload, {
				withCredentials: true,
			});
			const { data } = response;
			setMsg(data.message);
		} catch (err) {
			setErr(err.response.data.message);
		} finally {
			setLoading(false);
		}
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
				<FormTitle>Add New Department</FormTitle>
				<form onSubmit={onSubmit}>
					<FormTextField
						inputRef={nameRef}
						type="text"
						label="Department Name"
						variant="outlined"
						fullWidth
						required
					/>
					<FormButton
						type="submit"
						variant="contained"
						color="primary"
						loading={loading}>
						Add Department
					</FormButton>
				</form>
			</FormCard>
		</FormContainer>
	);
};

export default AddDepartment;
