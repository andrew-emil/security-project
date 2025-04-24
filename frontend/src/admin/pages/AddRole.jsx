import { useEffect, useState, useRef } from "react";
import {
	FormButton,
	FormCard,
	FormContainer,
	FormTextField,
	FormTitle,
} from "./../../components/StyledComponents";
import {
	Alert,
	FormGroup,
	AlertTitle,
	Skeleton,
	InputLabel,
	FormControl,
	Select,
	MenuItem,
	FormHelperText,
	Checkbox,
	FormControlLabel,
	Box,
	Button,
	IconButton,
} from "@mui/material";
import axiosClient from "../../axiosClient";
import { Add, Delete } from "@mui/icons-material";

const AddRole = () => {
	const [msg, setMsg] = useState(null);
	const [err, setErr] = useState(null);
	const [loading, setLoading] = useState(true);
	const [buttonLoading, setButtonLoading] = useState(false);
	const [permissions, setPermissions] = useState([]);
	const [procedureTypes, setProcedureTypes] = useState([]);
	const [roles, SetRoles] = useState([]);
	const [parentId, setParentId] = useState("");

	const [selectedPermissions, setSelectedPermissions] = useState([]);
	const [procedureRequirements, setProcedureRequirements] = useState([]);

	const nameRef = useRef();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [permissionsData, types, rolesData] = await Promise.all([
					axiosClient.get("/roles/permissions", { withCredentials: true }),
					axiosClient.get("/procedure-types", { withCredentials: true }),
					axiosClient.get("/roles", { withCredentials: true }),
				]);

				setPermissions(permissionsData.data);
				setProcedureTypes(types.data);
				SetRoles(rolesData.data.data);
			} catch (err) {
				setErr(err.response.data.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const addRequirement = () => {
		setProcedureRequirements([
			...procedureRequirements,
			{ procedureTypeId: "", requiredCount: 1, category: "" },
		]);
	};

	const removeRequirement = (index) => {
		const newRequirements = [...procedureRequirements];
		newRequirements.splice(index, 1);
		setProcedureRequirements(newRequirements);
	};

	const handleProcedureTypeChange = (index, procedureTypeId) => {
		const selectedProcedure = procedureTypes.find(
			(pt) => pt.id === procedureTypeId
		);
		const newRequirements = [...procedureRequirements];

		newRequirements[index] = {
			procedureTypeId,
			requiredCount: newRequirements[index].requiredCount,
			category: selectedProcedure?.category || "",
		};

		setProcedureRequirements(newRequirements);
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		setErr(null);
		setMsg(null);
		setButtonLoading(true);
		try {
			const payload = {
				name: nameRef.current.value,
				parentId: Number(parentId),
				permissionActions: selectedPermissions,
				procedureRequirements: procedureRequirements.map((req) => ({
					procedureTypeId: Number(req.procedureTypeId),
					requiredCount: Number(req.requiredCount),
					category: req.category,
				})),
			};
			const response = await axiosClient.post("/roles/", payload, {
				withCredentials: true,
			});

			const { data } = response;
			setMsg(data.message);
		} catch (err) {
			setErr(err.response.data.message);
		} finally {
			setButtonLoading(false);
		}
	};

	if (loading) {
		return (
			<FormContainer>
				<Skeleton variant="rounded" height={300} />
			</FormContainer>
		);
	}

	return (
		<FormContainer sx={{ height: "auto", marginY: "1rem" }}>
			<FormCard sx={{ width: 500 }}>
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
				<FormTitle>Add New Role</FormTitle>
				<form onSubmit={onSubmit}>
					<FormTextField
						inputRef={nameRef}
						type="text"
						label="Role Name"
						variant="outlined"
						fullWidth
						required
						margin="normal"
					/>
					<FormControl fullWidth margin="normal" required>
						<InputLabel>Parent Role</InputLabel>
						<Select
							value={parentId}
							onChange={(e) => setParentId(e.target.value)}
							label="Parent Role">
							{roles.map((role) => (
								<MenuItem key={role.id} value={role.id}>
									{role.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl component="fieldset" fullWidth margin="normal" required>
						<FormTitle>Permissions</FormTitle>
						<FormGroup
							sx={{
								display: "grid",
								gridTemplateColumns: "repeat(2, 1fr)",
								gap: 1,
							}}>
							{permissions.map((permission) => (
								<FormControlLabel
									key={permission.id}
									control={
										<Checkbox
											checked={selectedPermissions.includes(permission.id)}
											onChange={() =>
												setSelectedPermissions((prev) =>
													prev.includes(permission.id)
														? prev.filter((id) => id !== permission.id)
														: [...prev, permission.id]
												)
											}
										/>
									}
									label={permission.action}
								/>
							))}
						</FormGroup>
						<FormHelperText>Select at least one permission</FormHelperText>
					</FormControl>

					<Box mt={3} mb={2}>
						<InputLabel required sx={{mb: 2}}>Procedure Requirements</InputLabel>
						{procedureRequirements.map((req, index) => (
							<Box
								key={index}
								sx={{
									display: "flex",
									gap: 2,
									mb: 2,
									alignItems: "center",
									flexDirection: "column",
								}}>
								<FormControl fullWidth required>
									<InputLabel>Procedure Type</InputLabel>
									<Select
										value={req.procedureTypeId}
										onChange={(e) =>
											handleProcedureTypeChange(index, e.target.value)
										}
										label="Procedure Type">
										{procedureTypes.map((pt) => (
											<MenuItem key={pt.id} value={pt.id}>
												{pt.name} ({pt.category})
											</MenuItem>
										))}
									</Select>
								</FormControl>

								<FormTextField
									type="number"
									label="Required Count"
									value={req.requiredCount}
									onChange={(e) => {
										const newRequirements = [...procedureRequirements];
										newRequirements[index].requiredCount = Number(
											e.target.value
										);
										setProcedureRequirements(newRequirements);
									}}
									inputProps={{ min: 1 }}
									required
									fullWidth
								/>

								<FormTextField
									label="Category"
									value={req.category}
									InputProps={{ readOnly: true }}
									fullWidth
								/>

								<IconButton
									onClick={() => removeRequirement(index)}
									color="error">
									<Delete />
								</IconButton>
							</Box>
						))}

						<Button
							variant="outlined"
							onClick={addRequirement}
							startIcon={<Add />}
							sx={{ mt: 1 }}>
							Add Requirement
						</Button>
					</Box>
					<FormButton
						type="submit"
						variant="contained"
						color="primary"
						loading={buttonLoading}>
						Add role
					</FormButton>
				</form>
			</FormCard>
		</FormContainer>
	);
};

export default AddRole;
