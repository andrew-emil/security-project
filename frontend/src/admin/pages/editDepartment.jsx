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

const EditDepartment = () => {
	const [err, setErr] = useState(null);
	const [msg, setMsg] = useState(null);
	const [loading, setLoading] = useState(false);
	const nameRef = useRef();
	const location = useLocation();
	const { department } = location.state;

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setErr(null);
		setMsg(null);
		try {
			const payload = {
				id: department.id.toString(),
				name: nameRef.current.value,
			};
			const response = await axiosClient.put("departments", payload, {
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
				<FormTitle>Edit Department</FormTitle>
				<form onSubmit={onSubmit}>
					<FormTextField
						inputRef={nameRef}
						type="text"
						label="Department Name"
						variant="outlined"
						fullWidth
						required
						defaultValue={department.name}
					/>
					<FormButton
						type="submit"
						variant="contained"
						color="primary"
						loading={loading}>
						Edit Department
					</FormButton>
				</form>
			</FormCard>
		</FormContainer>
	);
};

export default EditDepartment;
