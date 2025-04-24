import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import MailIcon from "@mui/icons-material/Mail";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

import AccountCircle from "@mui/icons-material/AccountCircle";
import MoreIcon from "@mui/icons-material/MoreVert";
import { useStateContext } from "../context/contextprovider";
import DarkModeButton from "./darkmodeButton";
import { useNavigate } from "react-router-dom";
import { Link, Avatar } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import axiosClient from "../axiosClient";
import { convertImage } from "./../utils/convertImage";
import { useNotifications } from "./../hooks/useNotifications ";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import Notification from "./Notification";
import { Typography } from "@mui/material";
import { Circle } from "@mui/icons-material";
import AssignmentIndTwoTone from "@mui/icons-material/AssignmentIndTwoTone";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CallToActionIcon from "@mui/icons-material/CallToAction";
import ThreePIcon from "@mui/icons-material/ThreeP";
import { authorizedUser } from "../utils/authorizeUser";

const drawerWidth = 240;

const openedMixin = (theme) => ({
	width: drawerWidth,
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: "hidden",
});

const closedMixin = (theme) => ({
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: "hidden",
	width: `calc(${theme.spacing(7)} + 1px)`,
	[theme.breakpoints.up("sm")]: {
		width: `calc(${theme.spacing(8)} + 1px)`,
	},
});

const DrawerHeader = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "flex-end",
	padding: theme.spacing(0, 1),

	...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
	zIndex: theme.zIndex.drawer + 1,
	transition: theme.transitions.create(["width", "margin"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	variants: [
		{
			props: ({ open }) => open,
			style: {
				marginLeft: drawerWidth,
				width: `calc(100% - ${drawerWidth}px)`,
				transition: theme.transitions.create(["width", "margin"], {
					easing: theme.transitions.easing.sharp,
					duration: theme.transitions.duration.enteringScreen,
				}),
			},
		},
	],
}));

const Drawer = styled(MuiDrawer, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
	width: drawerWidth,
	flexShrink: 0,
	whiteSpace: "nowrap",
	boxSizing: "border-box",
	variants: [
		{
			props: ({ open }) => open,
			style: {
				...openedMixin(theme),
				"& .MuiDrawer-paper": openedMixin(theme),
			},
		},
		{
			props: ({ open }) => !open,
			style: {
				...closedMixin(theme),
				"& .MuiDrawer-paper": closedMixin(theme),
			},
		},
	],
}));

export default function MiniDrawer() {
	const theme = useTheme();
	const navigate = useNavigate();
	const [open, setOpen] = React.useState(false);

	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};

	const [anchorEl, setAnchorEl] = React.useState(null);
	const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

	const isMenuOpen = Boolean(anchorEl);
	const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

	const handleProfileMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMobileMenuClose = () => {
		setMobileMoreAnchorEl(null);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		handleMobileMenuClose();
	};
	const handleMyAccont = () => {
		navigate("/account");
	};

	const handleMobileMenuOpen = (event) => {
		setMobileMoreAnchorEl(event.currentTarget);
	};
	const { socket, user, logout } = useStateContext();
	const handlelogout = () => {
		logout();
	};

	const { notifications, unreadCount, setNotifications, setUnreadCount } =
		useNotifications();
	const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);

	const menuId = "primary-search-account-menu";
	const renderMenu = (
		<Menu
			anchorEl={anchorEl}
			anchorOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			id={menuId}
			keepMounted
			transformOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			open={isMenuOpen}
			onClose={handleMenuClose}>
			<MenuItem onClick={handleMyAccont}>My account</MenuItem>
			<MenuItem onClick={handlelogout}>Log Out</MenuItem>
		</Menu>
	);
	React.useEffect(() => {
		if (!socket || !user) return;

		socket.connect();
		const userId = user.id;

		socket.on(`notification:${userId}`, (notification) => {
			setNotifications((prev) => [notification, ...prev]);
		});

		return () => {
			socket.off(`notification:${userId}`);
			socket.disconnect();
		};
	}, [setNotifications, socket, user]);

	const mobileMenuId = "primary-search-account-menu-mobile";
	React.useEffect(() => {
		const loadNotifications = async () => {
			try {
				const response = await axiosClient.get(`/notification/${user.id}`, {
					withCredentials: true,
				});
				const { data } = response;

				setNotifications(data.notifications);
				setUnreadCount(data.unreadCount);
			} catch (error) {
				console.error("Error loading notifications:", error);
			}
		};

		loadNotifications();
	}, [setNotifications, setUnreadCount, user]);
	const renderMobileMenu = (
		<Menu
			anchorEl={mobileMoreAnchorEl}
			anchorOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			id={mobileMenuId}
			keepMounted
			transformOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			open={isMobileMenuOpen}
			onClose={handleMobileMenuClose}>
			<MenuItem
				onClick={() => {
					navigate("/notifications");
				}}>
				<IconButton
					size="large"
					aria-label={`show ${unreadCount} notification`}
					color="inherit">
					<Badge badgeContent={unreadCount} color="error">
						<MailIcon />
					</Badge>
				</IconButton>
				<p>Notifications</p>
			</MenuItem>
			<MenuItem onClick={handleProfileMenuOpen}>
				<IconButton
					size="large"
					edge="end"
					aria-label="account of current user"
					aria-controls={menuId}
					aria-haspopup="true"
					onClick={handleProfileMenuOpen}
					color="inherit">
					{user?.picture ? (
						<Avatar src={convertImage(user.picture.data)} />
					) : (
						<AccountCircle />
					)}
				</IconButton>
				<p>Profile</p>
			</MenuItem>
			<MenuItem>
				<DarkModeButton></DarkModeButton>
			</MenuItem>
		</Menu>
	);

	const handleNotificationClick = (event) => {
		setNotificationAnchorEl(event.currentTarget);
	};

	const handleCloseNotifications = () => {
		setNotificationAnchorEl(null);
	};

	const checkNotificationtype = (type) => {
		let navigateString;
		if (type === "invite" || type === "schedule_update") {
			navigateString = "/home";
		}
		if (type === "User Registration") {
			navigateString = "/admin/pending-users";
		}
		if (type === "auth_request") {
			navigateString = "/surgery-requests-management/all-requests";
		}
		if (type === "role Update") {
			navigateString = "/account";
		}

		return navigateString;
	};

	const markAsRead = async (notificationId, type) => {
		try {
			await axiosClient.patch(
				"/notification",
				{ userId: user.id, notificationId },
				{ withCredentials: true }
			);

			setNotifications((prev) =>
				prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
			);
			if (unreadCount > 0) {
				setUnreadCount((prev) => prev - 1);
			}
			const navigatePath = checkNotificationtype(type);

			navigate(navigatePath);
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<AppBar position="fixed" open={open}>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerOpen}
						edge="start"
						sx={[
							{
								marginRight: 5,
							},
							open && { display: "none" },
						]}>
						<MenuIcon />
					</IconButton>

					<Link
						href="/home"
						variant="h6"
						noWrap
						sx={{ display: { xs: "none", sm: "block", fontWeight: "bold" } }}
						underline="none"
						color="inherit">
						Surgical Web
					</Link>

					<Box sx={{ flexGrow: 1 }} />
					<Box sx={{ display: { xs: "none", md: "flex" } }}>
						<IconButton
							sx={{ marginX: 2 }}
							size="large"
							aria-label={`show ${unreadCount} notification`}
							color="inherit"
							onClick={handleNotificationClick}>
							<Badge badgeContent={unreadCount} color="error">
								<MailIcon />
							</Badge>
						</IconButton>
						<Menu
							sx={{
								width: "70rem",
								maxHeight: "40rem",
								position: "absolute",
								boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
								borderRadius: "8px",
								left: 50,
							}}
							anchorEl={notificationAnchorEl}
							open={Boolean(notificationAnchorEl)}
							onClose={handleCloseNotifications}>
							{notifications.map((notification) => (
								<MenuItem
									key={notification.id}
									sx={{
										borderBottom: "1px solid #f0f0f0",
										"&:last-child": {
											borderBottom: "none",
										},
										padding: "1rem",
										alignItems: "flex-start",
									}}
									onClick={() =>
										markAsRead(notification.id, notification.type)
									}>
									<Box
										sx={{
											width: "100%",
											display: "flex",
											gap: "0.75rem",
											alignItems: "flex-start",
										}}>
										{!notification.read && (
											<Circle
												sx={{
													color: "primary.main",
													fontSize: "10px",
													mt: "4px",
													flexShrink: 0,
												}}
											/>
										)}
										<Box
											sx={{
												flexGrow: 1,
												display: "flex",
												flexDirection: "column",
												gap: "0.5rem",
												width: "calc(100% - 20px)",
											}}>
											<Notification notification={notification} />
											<Typography
												variant="body2"
												sx={{
													color: "text.secondary",
													alignSelf: "flex-end",
													fontSize: "0.75rem",
													whiteSpace: "nowrap",
												}}>
												{notification.datetime}
											</Typography>
										</Box>
									</Box>
								</MenuItem>
							))}
							{notifications.length === 0 && (
								<MenuItem
									disabled
									sx={{
										display: "flex",
										justifyContent: "center",
										color: "text.secondary",
										py: 3,
									}}>
									No new notifications
								</MenuItem>
							)}
						</Menu>
						<Box sx={{ padding: 1 }}>
							<DarkModeButton></DarkModeButton>
						</Box>

						<IconButton
							size="large"
							edge="end"
							aria-label="account of current user"
							aria-controls={menuId}
							aria-haspopup="true"
							onClick={handleProfileMenuOpen}
							color="inherit">
							{user?.picture ? (
								<Avatar src={convertImage(user.picture.data)} />
							) : (
								<AccountCircle />
							)}
						</IconButton>
					</Box>
					<Box sx={{ display: { xs: "flex", md: "none" } }}>
						<IconButton
							size="large"
							aria-label="show more"
							aria-controls={mobileMenuId}
							aria-haspopup="true"
							onClick={handleMobileMenuOpen}
							color="inherit">
							<MoreIcon />
						</IconButton>
					</Box>
				</Toolbar>
			</AppBar>
			<Drawer variant="permanent" open={open}>
				<DrawerHeader>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === "rtl" ? (
							<ChevronRightIcon />
						) : (
							<ChevronLeftIcon />
						)}
					</IconButton>
				</DrawerHeader>
				<Divider />
				<List>
					<ListItem
						key={"home"}
						component="a"
						href="/home"
						disablePadding
						sx={{
							display: "block",
							textDecoration: "none",
							color: theme.palette.text.primary,
							"&:visited": {
								color: theme.palette.text.primary,
							},
							"&:hover": {
								textDecoration: "none",
							},
						}}>
						<ListItemButton
							sx={[
								{
									minHeight: 48,
									px: 2.5,
								},
								open
									? {
											justifyContent: "initial",
										}
									: {
											justifyContent: "center",
										},
							]}>
							<ListItemIcon
								sx={[
									{
										minWidth: 0,
										justifyContent: "center",
									},
									open
										? {
												mr: 3,
											}
										: {
												mr: "auto",
											},
								]}>
								<HomeIcon />
							</ListItemIcon>
							<ListItemText
								primary={"Home"}
								sx={[
									open
										? {
												opacity: 1,
											}
										: {
												opacity: 0,
											},
								]}
							/>
						</ListItemButton>
					</ListItem>
					{authorizedUser(user, ["admin", "consultant"], "create surgery") && (
						<ListItem
							key={"Surgery"}
							component="a"
							href="/surgeries"
							disablePadding
							sx={{
								display: "block",
								textDecoration: "none",
								color: theme.palette.text.primary,
								"&:visited": {
									color: theme.palette.text.primary,
								},
								"&:hover": {
									textDecoration: "none",
								},
							}}>
							<ListItemButton
								sx={[
									{
										minHeight: 48,
										px: 2.5,
									},
									open
										? {
												justifyContent: "initial",
											}
										: {
												justifyContent: "center",
											},
								]}>
								<ListItemIcon
									sx={[
										{
											minWidth: 0,
											justifyContent: "center",
										},
										open
											? {
													mr: 3,
												}
											: {
													mr: "auto",
												},
									]}>
									<LocalHospitalIcon />
								</ListItemIcon>
								<ListItemText
									primary={"Surgery"}
									sx={[
										open
											? {
													opacity: 1,
												}
											: {
													opacity: 0,
												},
									]}
								/>
							</ListItemButton>
						</ListItem>
					)}
					{authorizedUser(
						user,
						["admin", "consultant"],
						"create equipment"
					) && (
						<ListItem
							key={"ُEquipments"}
							component="a"
							href="/equipments"
							disablePadding
							sx={{
								display: "block",
								textDecoration: "none",
								color: theme.palette.text.primary,
								"&:visited": {
									color: theme.palette.text.primary,
								},
								"&:hover": {
									textDecoration: "none",
								},
							}}>
							<ListItemButton
								sx={[
									{
										minHeight: 48,
										px: 2.5,
									},
									open
										? {
												justifyContent: "initial",
											}
										: {
												justifyContent: "center",
											},
								]}>
								<ListItemIcon
									sx={[
										{
											minWidth: 0,
											justifyContent: "center",
										},
										open
											? {
													mr: 3,
												}
											: {
													mr: "auto",
												},
									]}>
									<VaccinesIcon />
								</ListItemIcon>
								<ListItemText
									primary={"Equipments"}
									sx={[
										open
											? {
													opacity: 1,
												}
											: {
													opacity: 0,
												},
									]}
								/>
							</ListItemButton>
						</ListItem>
					)}
				</List>
				<Divider />
				<List>
					{authorizedUser(user, [], "perform surgery") && (
						<ListItem
							key={"open-slots"}
							component="a"
							href="/surgeries-open-slots"
							disablePadding
							sx={{
								display: "block",
								textDecoration: "none",
								color: theme.palette.text.primary,
								"&:visited": {
									color: theme.palette.text.primary,
								},
								"&:hover": {
									textDecoration: "none",
								},
							}}>
							<ListItemButton
								sx={[
									{
										minHeight: 48,
										px: 2.5,
									},
									open
										? {
												justifyContent: "initial",
											}
										: {
												justifyContent: "center",
											},
								]}>
								<ListItemIcon
									sx={[
										{
											minWidth: 0,
											justifyContent: "center",
										},
										open
											? {
													mr: 3,
												}
											: {
													mr: "auto",
												},
									]}>
									<MedicalServicesIcon />
								</ListItemIcon>
								<ListItemText
									primary={"Open Slots"}
									sx={[
										open
											? {
													opacity: 1,
												}
											: {
													opacity: 0,
												},
									]}
								/>
							</ListItemButton>
						</ListItem>
					)}

					{authorizedUser(user, ["admin", "consultant"]) && (
						<ListItem
							key={"Role Management"}
							component="a"
							href="/consultant/roles"
							disablePadding
							sx={{
								display:
									user.userRole === "consultant" || user.userRole === "admin"
										? "block"
										: "none",
								textDecoration: "none",
								color: theme.palette.text.primary,
								"&:visited": {
									color: theme.palette.text.primary,
								},
								"&:hover": {
									textDecoration: "none",
								},
							}}>
							<ListItemButton
								sx={[
									{
										minHeight: 48,
										px: 2.5,
									},
									open
										? {
												justifyContent: "initial",
											}
										: {
												justifyContent: "center",
											},
								]}>
								<ListItemIcon
									sx={[
										{
											minWidth: 0,
											justifyContent: "center",
										},
										open
											? {
													mr: 3,
												}
											: {
													mr: "auto",
												},
									]}>
									<AssignmentIndTwoTone />
								</ListItemIcon>
								<ListItemText
									primary={"Role Management"}
									sx={[
										open
											? {
													opacity: 1,
												}
											: {
													opacity: 0,
												},
									]}
								/>
							</ListItemButton>
						</ListItem>
					)}
					<ListItem
						key={"Request Management"}
						component="a"
						href="/surgery-requests-management"
						disablePadding
						sx={{
							display:
								user.userRole === "consultant" || user.userRole === "admin"
									? "block"
									: "none",
							textDecoration: "none",
							color: theme.palette.text.primary,
							"&:visited": {
								color: theme.palette.text.primary,
							},
							"&:hover": {
								textDecoration: "none",
							},
						}}>
						<ListItemButton
							sx={[
								{
									minHeight: 48,
									px: 2.5,
								},
								open
									? {
											justifyContent: "initial",
										}
									: {
											justifyContent: "center",
										},
							]}>
							<ListItemIcon
								sx={[
									{
										minWidth: 0,
										justifyContent: "center",
									},
									open
										? {
												mr: 3,
											}
										: {
												mr: "auto",
											},
								]}>
								<PendingActionsIcon />
							</ListItemIcon>
							<ListItemText
								primary={"Requests Management"}
								sx={[
									open
										? {
												opacity: 1,
											}
										: {
												opacity: 0,
											},
								]}
							/>
						</ListItemButton>
					</ListItem>
					<ListItem
						key={"Admin Pannel"}
						component="a"
						href="/admin"
						disablePadding
						sx={{
							display: user.userRole === "admin" ? "block" : "none",
							textDecoration: "none",
							color: theme.palette.text.primary,
							"&:visited": {
								color: theme.palette.text.primary,
							},
							"&:hover": {
								textDecoration: "none",
							},
						}}>
						<ListItemButton
							sx={[
								{
									minHeight: 48,
									px: 2.5,
								},
								open
									? {
											justifyContent: "initial",
										}
									: {
											justifyContent: "center",
										},
							]}>
							<ListItemIcon
								sx={[
									{
										minWidth: 0,
										justifyContent: "center",
									},
									open
										? {
												mr: 3,
											}
										: {
												mr: "auto",
											},
								]}>
								<AdminPanelSettingsIcon />
							</ListItemIcon>
							<ListItemText
								primary={"Admin Pannel"}
								sx={[
									open
										? {
												opacity: 1,
											}
										: {
												opacity: 0,
											},
								]}
							/>
						</ListItemButton>
					</ListItem>
					{authorizedUser(user, [], "add surgical role") && (
						<ListItem
							key={"surgical-roles"}
							component="a"
							href="/surgical-roles"
							disablePadding
							sx={{
								display: "block",
								textDecoration: "none",
								color: theme.palette.text.primary,
								"&:visited": {
									color: theme.palette.text.primary,
								},
								"&:hover": {
									textDecoration: "none",
								},
							}}>
							<ListItemButton
								sx={[
									{
										minHeight: 48,
										px: 2.5,
									},
									open
										? {
												justifyContent: "initial",
											}
										: {
												justifyContent: "center",
											},
								]}>
								<ListItemIcon
									sx={[
										{
											minWidth: 0,
											justifyContent: "center",
										},
										open
											? {
													mr: 3,
												}
											: {
													mr: "auto",
												},
									]}>
									<ThreePIcon />
								</ListItemIcon>
								<ListItemText
									primary={"Surgical Roles"}
									sx={[
										open
											? {
													opacity: 1,
												}
											: {
													opacity: 0,
												},
									]}
								/>
							</ListItemButton>
						</ListItem>
					)}

					<ListItem
						key={"procedure-types"}
						component="a"
						href="/procedure-types"
						disablePadding
						sx={{
							display:
								user.userRole === "consultant" || user.userRole === "admin"
									? "block"
									: "none",
							textDecoration: "none",
							color: theme.palette.text.primary,
							"&:visited": {
								color: theme.palette.text.primary,
							},
							"&:hover": {
								textDecoration: "none",
							},
						}}>
						<ListItemButton
							sx={[
								{
									minHeight: 48,
									px: 2.5,
								},
								open
									? {
											justifyContent: "initial",
										}
									: {
											justifyContent: "center",
										},
							]}>
							<ListItemIcon
								sx={[
									{
										minWidth: 0,
										justifyContent: "center",
									},
									open
										? {
												mr: 3,
											}
										: {
												mr: "auto",
											},
								]}>
								<CallToActionIcon />
							</ListItemIcon>
							<ListItemText
								primary={"procedure-types"}
								sx={[
									open
										? {
												opacity: 1,
											}
										: {
												opacity: 0,
											},
								]}
							/>
						</ListItemButton>
					</ListItem>
				</List>
			</Drawer>
			{renderMobileMenu}
			{renderMenu}
		</Box>
	);
}
