import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import PageHeader from "./PageHeader";
import { AuthContext } from "../context";
import { cn } from "@/lib/utils";

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
	const { effectiveRole } = useContext(AuthContext);
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
		<div className="grid min-h-screen grid-cols-1 bg-gradient-to-b from-slate-50 to-blue-50/60 lg:grid-cols-[280px_minmax(0,1fr)]">
			<button
				type="button"
				onClick={() => setIsMobileNavOpen(false)}
				aria-label="Close navigation"
				className={cn(
					"fixed inset-0 z-30 border-0 bg-slate-900/40 p-0 transition-opacity duration-200 lg:hidden",
					isMobileNavOpen
						? "pointer-events-auto opacity-100"
						: "pointer-events-none opacity-0"
				)}
			/>

			<div
				className={cn(
					"z-40 border-r border-slate-200/60 bg-white/80 backdrop-blur-lg",
					"fixed top-0 left-0 h-screen w-[min(82vw,320px)] shadow-xl transition-transform duration-200 lg:sticky lg:w-auto lg:shadow-none",
					isMobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
				)}>
				<Sidebar
					role={resolvedPage}
					name={name}
					onNavigate={() => setIsMobileNavOpen(false)}
				/>
			</div>

			<div className="min-h-screen min-w-0 px-4 pt-5 pb-8 lg:px-8 lg:pt-7 lg:pb-10">
				<div className="mb-4 flex lg:hidden">
					<button
						type="button"
						onClick={() => setIsMobileNavOpen(true)}
						aria-label="Open navigation"
						className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-4 font-bold text-slate-900 shadow-sm">
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

				<div className="flex min-w-0 flex-col">{children}</div>
			</div>
		</div>
	);
}

export default Layout;
