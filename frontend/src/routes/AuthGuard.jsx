import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context";

const AuthGuard = ({ children }) => {
	const location = useLocation();
	const { user } = useContext(AuthContext);

	if (!user) {
		return (
			<Navigate
				to='/signin'
				state={{ from: location }}
				replace
			/>
		);
	}

	return children;
};

export default AuthGuard;
