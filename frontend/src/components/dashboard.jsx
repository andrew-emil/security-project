import { useState, useMemo } from "react";
import { extendTheme, styled } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import UsersPage from "../admin/pages/UsersPage";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AdminDashboard from "../admin/pages/AdminDashborad";
import PendingUsers from "../admin/pages/PendingUsers";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AffiliationPage from "../admin/pages/AffiliationPage";
import AffiliationDetails from "../admin/pages/AffiliationDetails";
import EditAffiliation from "../admin/pages/EditAffiliation";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIndTwoTone from "@mui/icons-material/AssignmentIndTwoTone";
import RolesPage from "./../admin/pages/RolesPage";
import AddRole from "../admin/pages/AddRole";
import EditRole from "../admin/pages/EditRole";
import CreateAffiliation from "./../admin/pages/CreateAffiliation";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { Navigate } from "react-router";
import AuditTrailTable from "../admin/pages/AuditTrailTable";
import ReportsPanel from "../admin/pages/ReportPanel";

const NAVIGATION = [
	{
		segment: "",
		title: "Home",
		icon: <HomeIcon />,
	},
	{
		kind: "header",
		title: "Main items",
	},
	{
		segment: "dashboard",
		title: "Dashboard",
		icon: <DashboardIcon />,
	},
	{
		segment: "pending_users",
		title: "Pending Users",
		icon: <PeopleIcon />,
	},
	{
		segment: "affiliation",
		title: "Affiliations",
		icon: <LocalHospitalIcon />,
	},
	{
		segment: "users",
		title: "Users",
		icon: <PersonIcon />,
	},
	{
		segment: "roles",
		title: "Roles",
		icon: <AssignmentIndTwoTone />,
	},
	{
		segment: "audit_trail",
		title: "Audit Trail",
		icon: <HistoryIcon />,
	},
	{
		segment: "reports",
		title: "Reports",
		icon: <AssessmentIcon />,
	},
];

const demoTheme = extendTheme({
	colorSchemes: { light: true, dark: true },
	colorSchemeSelector: "class",
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 600,
			lg: 1200,
			xl: 1536,
		},
	},
});

function useDemoRouter(initialPath) {
	const [pathname, setPathname] = useState(initialPath);

	const router = useMemo(() => {
		return {
			pathname,
			searchParams: new URLSearchParams(),
			navigate: (path) => setPathname(String(path)),
		};
	}, [pathname]);

	return router;
}

const Skeleton = styled("div")(({ theme, height }) => ({
	backgroundColor: theme.palette.action.hover,
	borderRadius: theme.shape.borderRadius,
	height,
	content: '" "',
}));
function DemoPageContent({
	pathname,
	navigate,
	selectedAffiliationId,
	setSelectedAffiliationId,
	selectedRoleId,
	setSelectedRoleId,
}) {
	let content = null;

	if (pathname === "/dashboard") {
		content = <AdminDashboard />;
	} else if (pathname === "/pending_users") {
		content = <PendingUsers />;
	} else if (pathname === "/affiliation") {
		content = (
			<AffiliationPage
				navigate={navigate}
				selectedAffiliationId={selectedAffiliationId}
				setSelectedAffiliationId={setSelectedAffiliationId}
			/>
		);
	} else if (pathname === "/") {
		content = <Navigate to="/" />; // or whatever you want
	} else if (pathname === "/affiliation-details") {
		content = <AffiliationDetails affiliationId={selectedAffiliationId} />;
	} else if (pathname === "/affiliations/edit") {
		content = <EditAffiliation affiliationId={selectedAffiliationId} />;
	} else if (pathname === "/create-affiliation") {
		content = <CreateAffiliation />;
	} else if (pathname === "/users") {
		content = <UsersPage />;
	} else if (pathname === "/roles") {
		content = (
			<RolesPage navigate={navigate} setSelectedRoleId={setSelectedRoleId} />
		);
	} else if (pathname === "/roles/add-role") {
		content = <AddRole />;
	} else if (pathname === "/roles/edit-role") {
		content = <EditRole roleId={selectedRoleId} />;
	} else if (pathname === "/audit_trail") {
		content = <AuditTrailTable />;
	} else if (pathname === "/reports") {
		content = <ReportsPanel />;
	} else {
		content = <Typography>Unknown page</Typography>;
	}

	return (
		<Box
			sx={{
				py: 4,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				textAlign: "center",
			}}>
			{content}
		</Box>
	);
}
export default function Dashboard(props) {
	const { window } = props;
	const [selectedAffiliationId, setSelectedAffiliationId] =
		useState(null);
	const [selectedRoleId, setSelectedRoleId] = useState(null);

	const router = useDemoRouter("/dashboard");

	// Remove this const when copying and pasting into your project.
	const demoWindow = window ? window() : undefined;

	return (
		<AppProvider
			navigation={NAVIGATION}
			router={router}
			theme={demoTheme}
			window={demoWindow}
			branding={{
				title: "Surgical Web",
				homeUrl: "/dashboard",
			}}>
			<DashboardLayout>
				<PageContainer>
					<DemoPageContent
						pathname={router.pathname}
						navigate={router.navigate}
						selectedAffiliationId={selectedAffiliationId}
						setSelectedAffiliationId={setSelectedAffiliationId}
						selectedRoleId={selectedRoleId}
						setSelectedRoleId={setSelectedRoleId}
					/>{" "}
				</PageContainer>
			</DashboardLayout>
		</AppProvider>
	);
}
