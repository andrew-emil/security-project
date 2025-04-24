import { useRef, useState } from "react";
import {
	FormCard,
	FormContainer,
	FormTextField,
	FormButton,
	FormTitle,
} from "../../components/StyledComponents";
import {
	Alert,
	AlertTitle,
	MenuItem,
	InputLabel,
	Select,
	FormControl,
} from "@mui/material";
import axiosClient from "../../axiosClient";

const institutionTypes = {
	HOSPITAL: "Hospital",
	CLINIC: "Clinic",
	RESEARCH_CENTER: "Research Center",
	UNIVERSITY: "University",
	MEDICAL_SCHOOL: "Medical School",
	PRIVATE_PRACTICE: "Private Practice",
};

const CreateAffiliation = () => {
	const nameRef = useRef();
	const countryRef = useRef();
	const cityRef = useRef();
	const addressRef = useRef();
	const [err, setErr] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [msg, setMsg] = useState(null);
	const [selectedType, setSelectedType] = useState(
		Object.values(institutionTypes)[0]
	);

	const handleChange = (event) => {
		setSelectedType(event.target.value);
	};

	const submit = async (ev) => {
		ev.preventDefault();
		setIsLoading(true);
		setErr(null)
		setMsg(null)
		const payload = {
			name: nameRef.current.value,
			country: countryRef.current.value,
			city: cityRef.current.value,
			address: addressRef.current.value,
			institution_type: selectedType,
		};

		try {
			const response = await axiosClient.post("/affiliation", payload, {
				withCredentials: true,
			});

			const { data } = response;
			setMsg(data.message);
		} catch (err) {
			console.error(err);
			setErr(err.response.message);
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
				<FormTitle>Add Affiliation</FormTitle>
				<form onSubmit={submit}>
					<FormTextField
						inputRef={nameRef}
						type="text"
						label="Affiliation Name"
						variant="outlined"
						fullWidth
						required
					/>
					<FormTextField
						inputRef={countryRef}
						type="text"
						label="Country"
						variant="outlined"
						fullWidth
						required
					/>
					<FormTextField
						inputRef={cityRef}
						type="text"
						label="City"
						variant="outlined"
						fullWidth
						required
					/>
					<FormTextField
						inputRef={addressRef}
						type="text"
						label="Address"
						variant="outlined"
						fullWidth
						required
					/>
					<FormControl fullWidth sx={{marginBottom: '1rem'}}>
						<InputLabel id="institution-type-label">
							Institution Type
						</InputLabel>
						<Select
							labelId="institution-type-label"
							id="institution-type"
							value={selectedType}
							label="Institution Type"
							onChange={handleChange}
							required>
							{Object.values(institutionTypes).map((type) => (
								<MenuItem key={type} value={type}>
									{type}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormButton
						type="submit"
						variant="contained"
						color="primary"
						loading={isLoading}>
						Create Affiliation
					</FormButton>
				</form>
			</FormCard>
		</FormContainer>
	);
};

export default CreateAffiliation;
