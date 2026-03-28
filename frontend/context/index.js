import React, { createContext, useMemo, useState } from "react";
import { getStoredUser, removeStoredUser, setStoredUser } from "../storage";

export const AuthContext = createContext({
	user: null,
	token: "",
	isAuthenticated: false,
	role: "",
	loading: false,
	authenticate: () => {},
	logout: () => {},
	updateUser: () => {},
});

function AuthContextProvider({ children, user: initialUser = null }) {
	const [user, setUser] = useState(() => initialUser ?? getStoredUser());
	const [loading] = useState(false);

	function authenticate(authUser) {
		setStoredUser(authUser);
		setUser(authUser);
	}

	function logout() {
		removeStoredUser();
		setUser(null);
	}

	function updateUser(data) {
		setStoredUser(data);
		setUser(data);
	}

	const value = useMemo(
		() => ({
			user,
			token: user?.token || "",
			isAuthenticated: Boolean(user),
			role: user?.role || "",
			loading,
			authenticate,
			logout,
			updateUser,
		}),
		[user, loading],
	);

	return React.createElement(AuthContext.Provider, { value }, children);
}

export default AuthContextProvider;
