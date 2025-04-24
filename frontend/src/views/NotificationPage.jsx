import { useNotifications } from "./../hooks/useNotifications ";
import { useEffect, useState } from "react";
import { useStateContext } from "../context/contextprovider";
import { useNavigate } from "react-router";
import axiosClient from "./../axiosClient";
import { Box, Container, List, ListItem } from "@mui/material";
import Notification from "./../components/Notification";
import { Circle } from "@mui/icons-material";

const NotificationPage = () => {
	const { notifications, unreadCount, setNotifications, setUnreadCount } =
		useNotifications();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);

	const { user, socket } = useStateContext();

	useEffect(() => {
		if (!socket || !user) return;

		socket.connect();
		const userId = user.id;

		socket.on(`notification:${userId}`, (notification) => {
			setNotifications((prev) => [notification, ...prev]);
		});

		const loadNotifications = async () => {
			try {
				const response = await axiosClient.get(`/notification/${userId}`, {
					withCredentials: true,
				});
				const { data } = response;

				setNotifications(data.notifications);
				setUnreadCount(data.unreadCount);
			} catch (error) {
				console.error("Error loading notifications:", error);
			} finally {
				setLoading(false);
			}
		};

		loadNotifications();

		return () => {
			socket.off(`notification:${userId}`);
			socket.disconnect();
		};
	}, [setNotifications, setUnreadCount, socket, user]);

	if (loading) return <div>Loading notifications...</div>;

	const checkNotificationtype = (type) => {
		let navigateString;
		if (type === "invite" || type === "schedule_update") {
			navigateString = "/home";
		}
		if (type === "User Registration") {
			navigateString = "/admin/pending-users";
		}
		if (type === "auth_request") {
			navigateString = "/";
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
		<Container>
			<List
				sx={{
					boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
					borderRadius: "8px",
					width: "100%",
					margin: 0,
					padding: 0,
				}}>
				{notifications.map((notification) => (
					<ListItem
						key={notification.id}
						sx={{
							borderBottom: "1px solid #f0f0f0",
							"&:last-child": {
								borderBottom: "none",
							},
							padding: "1rem",
							alignItems: "flex-start",
							cursor: "pointer",
						}}
						onClick={() => markAsRead(notification.id, notification.type)}>
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
								}}>
								<Notification notification={notification} />
							</Box>
						</Box>
					</ListItem>
				))}
				{notifications.length === 0 && (
					<ListItem
						disabled
						sx={{
							display: "flex",
							justifyContent: "center",
							color: "text.secondary",
							py: 3,
						}}>
						No new notifications
					</ListItem>
				)}
			</List>
		</Container>
	);
};

export default NotificationPage;
