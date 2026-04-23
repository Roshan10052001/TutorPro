import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
	BookOpen,
	CalendarClock,
	Compass,
	GraduationCap,
	LayoutDashboard,
	LogOut,
	ShieldCheck,
	UserCircle2,
	Users,
} from "lucide-react";
import { useConfirm } from "./ConfirmProvider";
import { AuthContext } from "../context";
import { getDashboardPath } from "../routes/path";
import { cn } from "@/lib/utils";

const studentLinks = [
	{ to: "/", label: "Home", end: true, icon: Compass },
	{ to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/student/tutors", label: "Find Tutors", icon: Users },
	{ to: "/student/tutor-apply", label: "Become a Tutor", icon: GraduationCap },
	{ to: "/student/sessions", label: "Sessions", icon: CalendarClock },
	{ to: "/student/profile", label: "Profile", icon: UserCircle2 },
];

const tutorLinks = [
	{ to: "/", label: "Home", end: true, icon: Compass },
	{ to: "/tutor/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/tutor/tutor-apply", label: "My Applications", icon: BookOpen },
	{ to: "/tutor/sessions", label: "My Sessions", icon: CalendarClock },
	{ to: "/tutor/profile", label: "Profile", icon: UserCircle2 },
];

const adminLinks = [
	{ to: "/", label: "Home", end: true, icon: Compass },
	{ to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/admin/tutor-applications", label: "Tutor Applications", icon: ShieldCheck },
	{ to: "/admin/tutor-accounts", label: "Manage Tutors", icon: Users },
	{ to: "/admin/sessions", label: "All Sessions", icon: CalendarClock },
	{ to: "/admin/profile", label: "Profile", icon: UserCircle2 },
];

function getNavigationLinks(role, userRole) {
	if (role === "Tutor") return tutorLinks;
	if (role === "Admin") return adminLinks;

	if (userRole === "tutor") {
		return [
			...studentLinks.filter((link) => link.to !== "/student/tutor-apply"),
			{ to: "/tutor/tutor-apply", label: "My Applications", icon: BookOpen },
		];
	}

	return studentLinks;
}

const linkBase =
	"group flex min-h-[50px] items-center gap-3 rounded-2xl px-3.5 py-3 font-semibold text-slate-600 transition hover:translate-x-[3px] hover:bg-blue-500/10 hover:text-blue-700";
const linkActive =
	"bg-[linear-gradient(135deg,rgba(37,99,235,0.15),rgba(14,165,233,0.12))] text-blue-800 ring-1 ring-inset ring-blue-500/15 shadow-sm";

function Sidebar({ role, name, onNavigate }) {
	const { user, activeView, canSwitchView, logout, switchView } =
		useContext(AuthContext);
	const links = getNavigationLinks(role, user?.role);
	const navigate = useNavigate();
	const confirm = useConfirm();

	const handleLogout = async () => {
		const ok = await confirm({
			title: "Confirmation",
			description: "Are you sure you want to log out?",
		});
		if (!ok) return;

		logout();
		onNavigate?.();
		navigate("/signin");
	};

	const handleSwitchView = (nextView) => {
		switchView(nextView);
		onNavigate?.();
		navigate(getDashboardPath(user?.role, nextView));
	};

	return (
		<nav
			className="flex h-full flex-col overflow-y-auto p-4 lg:p-[26px_18px]"
			aria-label={`${role} navigation`}>
			<div className="mb-[18px] border-b border-slate-200/60 px-2.5 pb-[18px]">
				<div className="flex items-center gap-3">
					<div className="grid h-[42px] w-[42px] flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 font-extrabold text-white shadow-lg shadow-blue-500/25">
						TP
					</div>
					<div>
						<h3 className="mb-1.5 text-lg font-extrabold text-slate-900">
							{name || `${role} Panel`}
						</h3>
						<p className="text-sm text-slate-500">TutorPro workspace</p>
					</div>
				</div>

				<div className="mt-4 rounded-2xl border border-white/60 bg-white/75 p-3 shadow-sm shadow-slate-200/50 backdrop-blur">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
						Active workspace
					</p>
					<div className="mt-2 flex items-center justify-between gap-3">
						<div>
							<p className="text-sm font-bold text-slate-900">{role} tools</p>
							<p className="text-xs text-slate-500">
								Shortcuts and role-based navigation
							</p>
						</div>
						<span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700">
							{role}
						</span>
					</div>
				</div>

				{canSwitchView ? (
					<div className="mt-3.5 flex flex-col gap-2.5 rounded-2xl bg-blue-500/10 p-3">
						<span className="text-sm font-bold text-blue-900">
							Current view: {activeView === "student" ? "Student" : "Tutor"}
						</span>
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() => handleSwitchView("student")}
								className={cn(
									"rounded-full border px-3 py-2 font-bold transition",
									activeView === "student"
										? "border-blue-600 bg-blue-600 text-white"
										: "border-blue-500/20 bg-white/90 text-slate-600"
								)}>
								Student View
							</button>
							<button
								type="button"
								onClick={() => handleSwitchView("tutor")}
								className={cn(
									"rounded-full border px-3 py-2 font-bold transition",
									activeView === "tutor"
										? "border-blue-600 bg-blue-600 text-white"
										: "border-blue-500/20 bg-white/90 text-slate-600"
								)}>
								Tutor View
							</button>
						</div>
					</div>
				) : null}
			</div>

			<div className="mb-3 px-2.5">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
					Navigation
				</p>
			</div>

			<div className="flex flex-1 flex-col gap-2.5">
				{links.map((link) => (
					<NavLink key={link.to} to={link.to} end={link.end} onClick={onNavigate}>
						{({ isActive }) => {
							const Icon = link.icon;
							return (
								<div className={cn(linkBase, isActive && linkActive)}>
									<span
										className={cn(
											"inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-700",
											isActive && "bg-white/80 text-blue-700"
										)}>
										<Icon className="h-4 w-4" />
									</span>
									<span>{link.label}</span>
								</div>
							);
						}}
					</NavLink>
				))}
			</div>

			<div className="mt-4 border-t border-slate-200/60 px-2.5 pt-4">
				<button
					type="button"
					onClick={handleLogout}
					className={cn(
						linkBase,
						"w-full justify-start border-0 bg-transparent px-1 text-left text-slate-500 hover:bg-transparent hover:text-rose-600"
					)}>
					<span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
						<LogOut className="h-4 w-4" />
					</span>
					<span>Logout</span>
				</button>
			</div>
		</nav>
	);
}

export default Sidebar;
