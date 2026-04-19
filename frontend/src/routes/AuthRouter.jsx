import * as React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Logout from "../pages/Logout";
import SelectView from "../pages/SelectView";

function AuthRouter() {
	return (
		<Routes>
			<Route
				path='/'
				element={<Home />}
			/>
			<Route
				path='/signin'
				element={<SignIn />}
			/>
			<Route
				path='/signup'
				element={<SignUp />}
			/>
			<Route
				path='/select-view'
				element={<SelectView />}
			/>
			<Route
				path='/logout'
				element={<Logout />}
			/>
		</Routes>
	);
}

export default AuthRouter;
