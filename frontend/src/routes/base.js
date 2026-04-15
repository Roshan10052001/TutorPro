import { lazy } from "react";
import { BasePaths } from "./path";

const BaseRoutes = [
	{
		path: "/*",
		component: lazy(() => import("./AuthRouter")),
		useAuth: false,
	},
	{
		path: `${BasePaths.ADMIN}/*`,
		component: lazy(() => import("./AdminRouter")),
		useAuth: true,
	},
	{
		path: `${BasePaths.STUDENT}/*`,
		component: lazy(() => import("./StudentRouter")),
		useAuth: true,
	},
	{
		path: `${BasePaths.TUTOR}/*`,
		component: lazy(() => import("./TutorRouter")),
		useAuth: true,
	},
];

export default BaseRoutes;
