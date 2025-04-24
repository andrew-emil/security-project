import { createBrowserRouter } from "react-router-dom";
import Login from "./views/login";
import Register from "./views/register";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import OTP_auth from "./views/OTP_auth";
import Home from "./views/home";
import ForgoPassword from "./views/forgot_password";
import ResetPassword from "./views/reset_password";
import NotFoundPage from "./views/not_found";
import AdminLayout from "./components/adminLayout";
import MyAccount from "./views/myAccount";
import CreateAffiliation from "./admin/pages/CreateAffiliation";
import CreateSurgery from "./views/createSurgery";
import SurgeryDetails from "./views/SurgeryDetails";
import Equipments from "./views/equipments";
import CreateEquipments from "./views/createEquipment";
import Surgeries from "./views/surgeries";
import AdminDashboard from "./admin/pages/AdminDashborad";
import PendingUsers from "./admin/pages/PendingUsers";
import AffiliationPage from "./admin/pages/AffiliationPage";
import EditEquipment from "./views/editEquipment";
import AffiliationDetails from "./admin/pages/AffiliationDetails";
import EditSurgery from "./views/editSurgery";
import OpenSlots from "./views/openSLots";
import AddDepartment from "./admin/pages/AddDepartments";
import EditDepartment from "./admin/pages/editDepartment";
import EditAffiliation from "./admin/pages/EditAffiliation";
import RolesPage from "./admin/pages/RolesPage";
import AddRole from "./admin/pages/AddRole";
import EditRole from "./admin/pages/EditRole";
import UsersPage from "./admin/pages/UsersPage";
import PostSurgery from "./views/postSurgery";
import RoleAssignmentPage from "./views/RoleAssignment";
import RoleManagmentPage from "./views/RoleManagmentPage";
import RequestPage from "./views/requestPage";

import SurgicalRolePage from "./views/SurgicalRoles";
import AddSurgicalRole from "./views/AddSurgicalRole";
import EditSurgicalRole from "./views/EditSurgicalRole";
import ProcedureTypePage from "./views/ProcedureTypes";
import AddProcedureType from "./views/AddProcedureType";
import EditProcedureType from "./views/EditProcedureType";
import RequestManagment from "./views/requestManagement";
import RequestsForSurgery from "./views/requestsForSurgery";
import NotificationPage from "./views/NotificationPage";
import AuditTrailTable from "./admin/pages/AuditTrailTable";
import ReportsPanel from "./admin/pages/ReportPanel";

const router = createBrowserRouter([
	{
		path: "/",
		element: <DefaultLayout />,
		children: [
			{ path: "/", element: <Home /> },
			{ path: "/home", element: <Home /> },
			{ path: "/account", element: <MyAccount /> },
			{ path: "/surgeryDetails", element: <SurgeryDetails /> },
			{ path: "/create_surgery", element: <CreateSurgery /> },
			{ path: "/equipments", element: <Equipments /> },
			{ path: "/add-equipment", element: <CreateEquipments /> },
			{ path: "/surgeries", element: <Surgeries /> },
			{ path: "/post-surgery", element: <PostSurgery /> },
			{ path: "/surgeries-open-slots", element: <OpenSlots /> },
			{ path: "/surgeriey-request", element: <RequestPage /> },
			{ path: "/surgery-requests-management", element: <RequestManagment /> },
			{
				path: "/surgery-requests-management/all-requests",
				element: <RequestsForSurgery />,
			},
			{ path: "/notifications", element: <NotificationPage /> },
			{ path: "/edit-surgery", element: <EditSurgery /> },
			{ path: "/edit-equipment", element: <EditEquipment /> },
			{ path: "/role-assign/:roleId", element: <RoleAssignmentPage /> },
			{ path: "/consultant/roles", element: <RoleManagmentPage /> },

			{ path: "/surgical-roles", element: <SurgicalRolePage /> },
			{ path: "/surgical-roles/add", element: <AddSurgicalRole /> },
			{ path: "/surgical-roles/edit", element: <EditSurgicalRole /> },

			{ path: "/procedure-types", element: <ProcedureTypePage /> },
			{ path: "/procedure-types/add", element: <AddProcedureType /> },
			{ path: "/procedure-types/edit", element: <EditProcedureType /> },

			{ path: "*", element: <NotFoundPage /> },
		],
	},
	{
		path: "/",
		element: <GuestLayout />,
		children: [
			{ path: "/login", element: <Login /> },
			{ path: "/register", element: <Register /> },
			{ path: "/forgot-password", element: <ForgoPassword /> },
			{ path: "/reset-password", element: <ResetPassword /> },
			{ path: "/otp", element: <OTP_auth /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
	{
		path: "/",
		element: <AdminLayout />,
		children: [
			{ path: "/admin", element: <AdminDashboard /> },
			{ path: "/admin/dashboard", element: <AdminDashboard /> },
			{ path: "/admin/pending-users", element: <PendingUsers /> },
			{ path: "/admin/affiliations", element: <AffiliationPage /> },
			{ path: "/admin/create-affiliation", element: <CreateAffiliation /> },
			{ path: "/admin/affiliation-details", element: <AffiliationDetails /> },
			{ path: "/admin/affiliations/edit", element: <EditAffiliation /> },
			{ path: "/admin/add-department", element: <AddDepartment /> },
			{ path: "/admin/edit-department", element: <EditDepartment /> },
			{ path: "/admin/users", element: <UsersPage /> },

			{ path: "/admin/roles", element: <RolesPage /> },

			{ path: "/admin/roles/add-role", element: <AddRole /> },
			{ path: "/admin/roles/edit", element: <EditRole /> },

			{ path: "/admin/audit", element: <AuditTrailTable /> },
			{ path: "/admin/report", element: <ReportsPanel /> },
		],
	},
]);

export default router;
