import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import {
  FormContainer,
  FormCard,
  FormTitle,
  FormButton,
} from "../components/StyledComponents";
import {
  Alert,
  FormGroup,
  AlertTitle,
  Skeleton,
  FormControl,
  FormHelperText,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useParams } from "react-router";

const RoleAssignmentPage = () => {
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const { roleId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const [permissionsData] = await Promise.all([
          axiosClient.get("/roles/permissions", { withCredentials: true }),
        ]);

        setPermissions(permissionsData.data);
      } catch (err) {
        setErr(err.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setButtonLoading(true);
    try {
      const payload = {
        permissions: selectedPermissions,
      };
      const response = await axiosClient.put(
        `/roles/assign-perm/${roleId}`,
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

  if (loading) {
    return (
      <FormContainer>
        <Skeleton variant="rounded" height={300} />
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <FormCard sx={{ width: "100%" }}>
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
        <FormTitle>Role Assignment</FormTitle>
        <form onSubmit={onSubmit}>
          <FormControl component="fieldset" fullWidth margin="normal" required>
            <FormTitle>Permissions</FormTitle>
            <FormGroup
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1,
              }}
            >
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
          <FormButton
            type="submit"
            variant="contained"
            color="primary"
            loading={buttonLoading}
          >
            Assign Role
          </FormButton>
        </form>
      </FormCard>
    </FormContainer>
  );
};

export default RoleAssignmentPage;
