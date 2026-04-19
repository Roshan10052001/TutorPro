import React, { createContext, useMemo, useState } from "react";
import { getStoredUser, removeStoredUser, setStoredUser } from "../storage";

const VALID_TUTOR_VIEWS = ["student", "tutor"];

function resolveActiveView(authUser, fallbackView = null) {
	if (!authUser?.role) return null;

	if (authUser.role === "student") return "student";
	if (authUser.role === "admin") return "admin";

	if (authUser.role === "tutor") {
		return VALID_TUTOR_VIEWS.includes(fallbackView) ? fallbackView : null;
	}

	return null;
}

function buildStoredAuth(authUser, fallbackView = null) {
	if (!authUser) return null;

	return {
		...authUser,
		activeView: resolveActiveView(authUser, authUser.activeView ?? fallbackView),
	};
}

export const AuthContext = createContext({
	user: null,
	token: "",
	isAuthenticated: false,
	role: "",
	activeView: null,
	effectiveRole: "",
	canSwitchView: false,
	loading: false,
	authenticate: () => {},
	logout: () => {},
	updateUser: () => {},
	switchView: () => {},
});

function AuthContextProvider({ children, user: initialUser = null }) {
	const [user, setUser] = useState(() =>
		buildStoredAuth(initialUser ?? getStoredUser()),
	);
	const [loading] = useState(false);

	function authenticate(authUser) {
		const nextUser = buildStoredAuth(authUser, user?.activeView);
		setStoredUser(nextUser);
		setUser(nextUser);
	}

	function logout() {
		removeStoredUser();
		setUser(null);
	}

	function updateUser(data) {
		setUser((currentUser) => {
			const nextUser = buildStoredAuth(
				{
				...(currentUser || {}),
				...(data || {}),
				token: data?.token || currentUser?.token || "",
				},
				currentUser?.activeView,
			);

			setStoredUser(nextUser);
			return nextUser;
		});
	}

	function switchView(nextView) {
		setUser((currentUser) => {
			if (!currentUser || currentUser.role !== "tutor") {
				return currentUser;
			}

			if (!VALID_TUTOR_VIEWS.includes(nextView)) {
				return currentUser;
			}

			const nextUser = {
				...currentUser,
				activeView: nextView,
			};

			setStoredUser(nextUser);
			return nextUser;
		});
	}

	const activeView = user?.activeView || null;
	const effectiveRole =
		user?.role === "tutor" ? activeView || "" : user?.role || "";
	const canSwitchView = user?.role === "tutor";

	const value = useMemo(
		() => ({
			user,
			token: user?.token || "",
			isAuthenticated: Boolean(user),
			role: user?.role || "",
			activeView,
			effectiveRole,
			canSwitchView,
			loading,
			authenticate,
			logout,
			updateUser,
			switchView,
		}),
		[user, activeView, effectiveRole, canSwitchView, loading],
	);

	return React.createElement(AuthContext.Provider, { value }, children);
}

export default AuthContextProvider;
