import React, { createContext } from "react";

export const AuthContext = createContext({
	user: undefined,
	me: undefined,
	role: "",
	context: {},
	loading: false,
});

function AuthContextProvider({ context, user, role, children, me, loading }) {
	const value = {
		user: user,
		role: role,
		context: context,
		me: me,
		loading: loading,
	};

	return React.createElement(AuthContext.Provider, { value }, children);
}

export default AuthContextProvider;
