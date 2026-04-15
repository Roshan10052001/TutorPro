import * as React from "react";
import { Fragment, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const privateRoutes = [
	{
		path: "dashboard",
		element: lazy(() => import("../pages/TutorDashboard")),
	},
	{
		path: "sessions",
		element: lazy(() => import("../pages/Sessions")),
	},
	{
		path: "profile",
		element: lazy(() => import("../pages/Profile")),
	},
	{
		path: "tutor-apply",
		element: lazy(() => import("../pages/TutorApply")),
	},
];

function Tutor() {
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

export default Tutor;
