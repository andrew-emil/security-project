import { useEffect, useState } from "react";
import {
	FormButton,
	FormCard,
	FormContainer,
	FormTextField,
	FormTitle,
} from "./../../components/StyledComponents";
import {
	Alert,
	AlertTitle,
	Skeleton,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Checkbox,
	FormGroup,
	FormControlLabel,
	FormHelperText,
	Box,
	IconButton,
	Button,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import axiosClient from "../../axiosClient";
import { PropTypes } from "prop-types";

const EditRole = ({ roleId }) => {
	const [msg, setMsg] = useState(null);
	const [err, setErr] = useState(null);
	const [loading, setLoading] = useState(true);
	const [buttonLoading, setButtonLoading] = useState(false);
	const [permissions, setPermissions] = useState([]);
	const [procedureTypes, setProcedureTypes] = useState([]);
	const [roles, setRoles] = useState([]);

	const [name, setName] = useState("");
	const [parentId, setParentId] = useState("");
	const [selectedPermissions, setSelectedPermissions] = useState([]);
	const [procedureRequirements, setProcedureRequirements] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [roleData, permissionsData, types, rolesData] = await Promise.all(
					[
						axiosClient.get(`/roles/get-role/${roleId}`, {
							withCredentials: true,
						}),
						axiosClient.get("/roles/permissions", { withCredentials: true }),
						axiosClient.get("/procedure-types", { withCredentials: true }),
						axiosClient.get("/roles", { withCredentials: true }),
					]
				);

				const { name, parent, permissions } = roleData.data;
				const requirments = roleData.data.requirements
					? roleData.data.requirements
					: null;
				setName(name);
				setParentId(parent?.id || "");
				setSelectedPermissions(permissions.map((p) => p.id));
				if (requirments != null) {
					setProcedureRequirements(
						requirments.map((req) => ({
							procedureTypeId: req.procedure.id,
							requiredCount: req.requiredCount,
							category: req.procedure.category,
						}))
					);
				}

				setPermissions(permissionsData.data);
				setProcedureTypes(types.data);
				setRoles(rolesData.data.data);
			} catch (err) {
				console.error(err);
				setErr(err.response?.data?.message || "Failed to load role data");
			} finally {
				setLoading(false);
			}
		};

		if (roleId) fetchData();
	}, [roleId]);

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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setButtonLoading(true);
		setErr(null);
		setMsg(null);

		try {
			const response = await axiosClient.put(
				`/roles`,
				{
					id: Number(roleId),
					name,
					parentId: Number(parentId),
					permissions: selectedPermissions,
					procedureRequirements: procedureRequirements.map((req) => ({
						procedureTypeId: Number(req.procedureTypeId),
						requiredCount: Number(req.requiredCount),
						category: req.category,
					})),
				},
				{ withCredentials: true }
			);
			const { data } = response;
			setMsg(data.message);
		} catch (err) {
			console.error(err);
			setErr(err.response?.data?.message || "Failed to update role");
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

	if (!roleId) {
		return (
			<FormContainer>
				<Alert severity="error">
					<AlertTitle>Error</AlertTitle>
					No role ID specified
				</Alert>
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
				<FormTitle>Edit Role</FormTitle>

				<form onSubmit={handleSubmit}>
					<FormTextField
						value={name}
						onChange={(e) => setName(e.target.value)}
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
						<InputLabel required sx={{ mb: 2 }}>
							Procedure Requirements
						</InputLabel>
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
						disabled={buttonLoading}>
						{buttonLoading ? "Updating..." : "Update Role"}
					</FormButton>
				</form>
			</FormCard>
		</FormContainer>
	);
};

EditRole.propTypes = {
	roleId: PropTypes.string.isRequired,
};

export default EditRole;
