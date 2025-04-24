import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Dashboard from "./dashboard";

export default function AdminLayout() {
  return (
    <Box id="defaultLayout" sx={{ display: "block" }}>
      <Dashboard></Dashboard>
    </Box>
  );
}
