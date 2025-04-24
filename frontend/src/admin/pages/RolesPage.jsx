import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Container,
  Skeleton,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import axiosClient from "../../axiosClient";
import { PropTypes } from "prop-types";

const RolesPage = ({ navigate, setSelectedRoleId }) => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get("roles", {
          withCredentials: true,
        });
        const { data } = response;
        setRoles(data.data);
      } catch (err) {
        setErr(err.response.data.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddRole = () => navigate("/roles/add-role");

  const handleDeleteRole = async (roleId) => {
    try {
      await axiosClient.delete(`/roles/${roleId}`, { withCredentials: true });
      setRoles((prev) => prev.filter((role) => role.id !== roleId));
    } catch (err) {
      setErr(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton variant="text" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </TableCell>
              <TableCell>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={40} height={40} />
              </TableCell>
            </TableRow>
          ))}
      </Container>
    );
  }

  if (err) {
    return (
      <Container
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          width: "auto",
        }}
      >
        {err && (
          <Typography
            variant="h4"
            sx={{
              marginBottom: "1rem",
              color: "red",
            }}
          >
            {err}
          </Typography>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
        <Typography variant="h4">Roles Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddRole}
        >
          Add Role
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell>Requirements</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.parent?.name || "N/A"}</TableCell>
                <TableCell>
                  {role.requirements?.map((req) => (
                    <div key={req.id}>
                      {req.procedure.name} ({req.procedure.category}) -
                      Required: {req.requiredCount}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      navigate(`/roles/edit-role`);
                      setSelectedRoleId(role.id);
                    }}
                  >
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteRole(role.id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

RolesPage.propTypes = {
  navigate: PropTypes.func.isRequired,
  setSelectedRoleId: PropTypes.func.isRequired,
};
export default RolesPage;
