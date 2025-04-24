import {
	useContext,
	useState,
	createContext,
	useCallback,
	useEffect,
	useRef,
} from "react";
import { io } from "socket.io-client";
import axiosClient, { registerAuthInterceptors } from "../axiosClient";

const StateContext = createContext({
	user: null,
	token: null,
	settings: { theme: "light", language: "en" },
	socket: null,
	setUser: () => {},
	setToken: () => {},
	setSettings: () => {},
	logout: () => {},
	refreshAuth: () => Promise.resolve(),
});

// eslint-disable-next-line react/prop-types
export const ContextProvider = ({ children }) => {
	const [user, _setUser] = useState(() => {
		const u = localStorage.getItem("user");
		return u ? JSON.parse(u) : null;
	});
	const [token, _setToken] = useState(() =>
		localStorage.getItem("access_token")
	);
	const [settings, _setSettings] = useState(() => {
		const savedSettings = localStorage.getItem("user_settings");
		return savedSettings
			? JSON.parse(savedSettings)
			: { theme: "light", language: "en" };
	});
	const [socket, setSocket] = useState(null);
	const refreshPromise = useRef(null);

	const setToken = useCallback((newToken) => {
		_setToken(newToken);
		if (newToken) localStorage.setItem("access_token", newToken);
		else localStorage.removeItem("access_token");
	}, []);

	const setUser = useCallback((user) => {
		_setUser(user);
		if (user) localStorage.setItem("user", JSON.stringify(user));
		else localStorage.removeItem("user");
	}, []);

	const logout = useCallback(() => {
		axiosClient
			.post("/users/logout", {}, { withCredentials: true })
			.finally(() => {
				setUser(null);
				setToken(null);
				if (socket) {
					socket.disconnect();
					setSocket(null);
				}
				window.location.href = "/login";
			});
	}, [socket, setUser, setToken]);

	const setSettings = useCallback((newSettings) => {
		if (typeof newSettings === "string") {
			newSettings = { theme: newSettings };
		}

		_setSettings((prev) => {
			const updated = { ...prev, ...newSettings };
			localStorage.setItem("user_settings", JSON.stringify(updated));
			return updated;
		});
	}, []);

	const SOCKET_URL = "http://localhost:4000";

	useEffect(() => {
		let newSocket;
		if (token && !socket) {
			newSocket = io(SOCKET_URL, {
				withCredentials: true,
				autoConnect: true,
			});

			newSocket.on("connect", () => setSocket(newSocket));
			newSocket.on("disconnect", (reason) => {
				if (reason === "io server disconnect") {
					setTimeout(() => newSocket.connect(), 1000);
				}
			});
			newSocket.on("connect_error", (err) => {
				console.error("Socket connection error:", err.message);
			});
		}

		return () => {
			if (newSocket) {
				newSocket.off("connect");
				newSocket.off("disconnect");
				newSocket.off("connect_error");
				newSocket.disconnect();
			}
		};
	}, [token, socket]);

	const refreshAuth = useCallback(async () => {
		if (refreshPromise.current) return refreshPromise.current;

		refreshPromise.current = axiosClient
			.post("/users/refresh", {}, { withCredentials: true })
			.then((res) => {
				if (!res.data?.accessToken) {
					throw new Error("No access token in response");
				}
				setToken(res.data.accessToken);
				return res.data.accessToken;
			})
			.catch((err) => {
				logout();
				throw err;
			})
			.finally(() => {
				refreshPromise.current = null;
			});

		return refreshPromise.current;
	}, [logout, setToken]);

	useEffect(() => {
		registerAuthInterceptors({ refreshAuth, logout });
	}, [refreshAuth, logout]);

	return (
		<StateContext.Provider
			value={{
				user,
				token,
				settings,
				socket,
				setUser,
				setToken,
				setSettings,
				logout,
				refreshAuth,
			}}>
			{children}
		</StateContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStateContext = () => useContext(StateContext);
