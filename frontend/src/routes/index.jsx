import { Fragment, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AuthGuard from "./AuthGuard";
import BaseRoutes from "./base";
import Loader from "../components/Loader";

const renderRoute = (route) => {
	const { useAuth, component: Component, path } = route;
	return (
		<Route
			key={path}
			path={path}
			element={
				<Fragment>
					<Suspense fallback={<Loader />}>
						{useAuth ? (
							<AuthGuard>
								<Component />
							</AuthGuard>
						) : (
							<Component />
						)}
					</Suspense>
				</Fragment>
			}
		/>
	);
};

const RoutesWrapper = () => {
	return <Routes>{BaseRoutes.map((route) => renderRoute(route))}</Routes>;
};
export default RoutesWrapper;
