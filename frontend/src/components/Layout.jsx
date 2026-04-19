import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import PageHeader from "./PageHeader";
import { AuthContext } from "../context";
import "../styles/dashboard.css";
import "../styles/layout.css";

function Layout({
	page,
	name,
	title,
	subtitle,
	buttonText,
	onButtonClick,
	headerAction,
	children,
}) {
	const { user, effectiveRole } = useContext(AuthContext);
	const location = useLocation();
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

	const resolvedPage = useMemo(() => {
		if (page) return page;

		if (effectiveRole === "admin") return "Admin";
		if (effectiveRole === "tutor") return "Tutor";
		return "Student";
	}, [page, effectiveRole]);

	useEffect(() => {
		setIsMobileNavOpen(false);
	}, [location.pathname]);

	return (
		<div className='appContainer'>
			<button
				type='button'
				className={`appBackdrop${isMobileNavOpen ? " visible" : ""}`}
				onClick={() => setIsMobileNavOpen(false)}
				aria-label='Close navigation'
			/>

			<div className={`appSidebarShell${isMobileNavOpen ? " open" : ""}`}>
				<Sidebar
					role={resolvedPage}
					name={name}
					onNavigate={() => setIsMobileNavOpen(false)}
				/>
			</div>

			<div className='contentsRight'>
				<div className='layoutUtilityBar'>
					<button
						type='button'
						className='appNavToggle'
						onClick={() => setIsMobileNavOpen(true)}
						aria-label='Open navigation'>
						Menu
					</button>
				</div>

				{title ? (
					<PageHeader
						title={title}
						subtitle={subtitle}
						buttonText={buttonText}
						onClick={onButtonClick}
						actions={headerAction}
					/>
				) : null}

				<div className='pageCTX'>{children}</div>
			</div>
		</div>
	);
}

export default Layout;
