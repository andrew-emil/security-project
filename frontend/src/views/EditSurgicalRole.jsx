import {
	FormCard,
	FormContainer,
	FormTitle,
	FormTextField,
	FormButton,
} from "../components/StyledComponents";
import { Alert, AlertTitle } from "@mui/material";
import { useState, useRef } from "react";
import axiosClient from "../axiosClient";
import { useSearchParams } from "react-router-dom";

const EditSurgicalRole = () => {
	const [err, setErr] = useState(null);
	const [msg, setMsg] = useState(null);
	const [buttonLoading, setButtonLoading] = useState(false);

	const nameRef = useRef();

	const [searchParams] = useSearchParams();
	const roleId = searchParams.get("id");
	const roleName = searchParams.get("name");

	const onSubmit = async (e) => {
		e.preventDefault();
		setButtonLoading(true);
		setErr(null);
		setMsg(null);
		try {
			const payload = {
				name: nameRef.current.value,
			};
			const response = await axiosClient.put(
				`/surgical-role/${roleId}`,
				payload,
				{
					withCredentials: true,
				}
			);
			const { data } = response;
			setMsg(data.message);
		} catch (err) {
			setErr(err.response.data.message);
		} finally {
			setButtonLoading(false);
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
				<FormTitle>Edit Surgical Role</FormTitle>
				<form onSubmit={onSubmit}>
					<FormTextField
						inputRef={nameRef}
						type="text"
						label="Surgical role Name"
						variant="outlined"
						fullWidth
						required
						defaultValue={roleName}
					/>

					<FormButton
						type="submit"
						variant="contained"
						color="primary"
						loading={buttonLoading}>
						Edit Surgical Role
					</FormButton>
				</form>
			</FormCard>
		</FormContainer>
	);
};

export default EditSurgicalRole;
