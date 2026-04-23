import { useContext, useMemo, useState } from "react";
import { Menu, PanelLeftClose } from "lucide-react";
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
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

	const resolvedPage = useMemo(() => {
		if (page) return page;
		if (effectiveRole === "admin") return "Admin";
		if (effectiveRole === "tutor") return "Tutor";
		return "Student";
	}, [page, effectiveRole]);

	return (
		<div className="relative grid min-h-screen grid-cols-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] lg:grid-cols-[300px_minmax(0,1fr)]">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute left-[-7rem] top-16 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl" />
				<div className="absolute right-[-5rem] top-32 h-64 w-64 rounded-full bg-cyan-200/30 blur-3xl" />
				<div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />
			</div>

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
					"z-40 border-r border-white/40 bg-white/72 backdrop-blur-xl",
					"fixed top-0 left-0 h-screen w-[min(82vw,320px)] shadow-xl transition-transform duration-200 lg:sticky lg:w-auto lg:shadow-none",
					isMobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
				)}>
				<Sidebar
					role={resolvedPage}
					name={name}
					onNavigate={() => setIsMobileNavOpen(false)}
				/>
			</div>

			<div className="relative min-h-screen min-w-0 px-4 pt-5 pb-8 lg:px-8 lg:pt-7 lg:pb-10">
				<div className="mb-4 flex lg:hidden">
					<button
						type="button"
						onClick={() => setIsMobileNavOpen(true)}
						aria-label="Open navigation"
						className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-4 font-bold text-slate-900 shadow-lg shadow-blue-900/5 backdrop-blur">
						<Menu className="h-4 w-4" />
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

				{isMobileNavOpen ? (
					<button
						type="button"
						onClick={() => setIsMobileNavOpen(false)}
						aria-label="Close navigation"
						className="fixed right-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/90 text-slate-900 shadow-lg backdrop-blur lg:hidden">
						<PanelLeftClose className="h-5 w-5" />
					</button>
				) : null}
			</div>
		</div>
	);
}

export default Layout;
