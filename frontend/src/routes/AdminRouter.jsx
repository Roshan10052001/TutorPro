import * as React from "react";
import { Fragment, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const privateRoutes = [
	{
		path: "dashboard",
		element: lazy(() => import("../pages/AdminDashboard")),
	},
	{
		path: "tutor-applications",
		element: lazy(() => import("../pages/AdminTutorApplications")),
	},
	{
		path: "tutor-accounts",
		element: lazy(() => import("../pages/AdminTutorAccounts")),
	},
	{
		path: "sessions",
		element: lazy(() => import("../pages/Sessions")),
	},
	{
		path: "profile",
		element: lazy(() => import("../pages/Profile")),
	},
];

function Admin() {
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

export default Admin;
