import * as React from "react";
import { Fragment, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context";

const privateRoutes = [
	{
		path: "dashboard",
		element: lazy(() => import("../pages/StudentDashboard")),
	},
	{
		path: "tutors",
		element: lazy(() => import("../pages/Tutors")),
	},
	{
		path: "tutors/:tutorId",
		element: lazy(() => import("../pages/TutorDetail")),
	},
	{
		path: "tutor-apply",
		element: lazy(() => import("../pages/TutorApply")),
	},
	{
		path: "profile",
		element: lazy(() => import("../pages/Profile")),
	},
	{
		path: "sessions",
		element: lazy(() => import("../pages/Sessions")),
	},
];

function Student() {
	const { role, activeView } = useContext(AuthContext);

	if (!(role === "student" || (role === "tutor" && activeView === "student"))) {
		return (
			<Navigate
				to={role === "tutor" ? "/tutor/dashboard" : "/"}
				replace
			/>
		);
	}

	return (
		<Routes>
			{privateRoutes.map(({ path, element: Component }) => {
				const LazyComponent = Component;
				return (
					<Fragment key={path}>
						<Route
							path={path}
							element={
								<Suspense fallback={<div>Loading...</div>}>
									<LazyComponent />
								</Suspense>
							}
						/>
					</Fragment>
				);
			})}
		</Routes>
	);
}

export default Student;
