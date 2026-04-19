import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context";
import { getDashboardPath } from "../routes/path";
import { cn } from "@/lib/utils";

const studentLinks = [
	{ to: "/", label: "Home", end: true },
	{ to: "/student/dashboard", label: "Dashboard" },
	{ to: "/student/tutors", label: "Find Tutors" },
	{ to: "/student/tutor-apply", label: "Become a Tutor" },
	{ to: "/student/sessions", label: "Sessions" },
	{ to: "/student/profile", label: "Profile" },
];

const tutorLinks = [
	{ to: "/", label: "Home", end: true },
	{ to: "/tutor/dashboard", label: "Dashboard" },
	{ to: "/tutor/tutor-apply", label: "My Applications" },
	{ to: "/tutor/sessions", label: "My Sessions" },
	{ to: "/tutor/profile", label: "Profile" },
];

const adminLinks = [
	{ to: "/", label: "Home", end: true },
	{ to: "/admin/dashboard", label: "Dashboard" },
	{ to: "/admin/tutor-applications", label: "Tutor Applications" },
	{ to: "/admin/tutor-accounts", label: "Manage Tutors" },
	{ to: "/admin/sessions", label: "All Sessions" },
	{ to: "/admin/profile", label: "Profile" },
];

function getNavigationLinks(role, userRole) {
	if (role === "Tutor") return tutorLinks;
	if (role === "Admin") return adminLinks;

	if (userRole === "tutor") {
		return [
			...studentLinks.filter((link) => link.to !== "/student/tutor-apply"),
			{ to: "/tutor/tutor-apply", label: "My Applications" },
		];
	}

	return studentLinks;
}

const linkBase =
	"flex min-h-[48px] items-center rounded-2xl px-3.5 py-3 font-semibold text-slate-600 transition hover:-translate-x-0 hover:translate-x-[3px] hover:bg-blue-500/10 hover:text-blue-700";
const linkActive = "bg-blue-500/15 text-blue-700 ring-1 ring-inset ring-blue-500/15";

function Sidebar({ role, name, onNavigate }) {
	const { user, activeView, canSwitchView, logout, switchView } =
		useContext(AuthContext);
	const links = getNavigationLinks(role, user?.role);
	const navigate = useNavigate();

	const handleLogout = async () => {
		const result = await Swal.fire({
			title: "Confirmation",
			text: "Are you sure you want to log out?",
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "Cancel",
			reverseButtons: true,
		});

		if (!result.isConfirmed) return;

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
						<p className="text-sm text-slate-500">TutorPro</p>
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

			<div className="flex flex-col gap-2.5">
				{links.map((link) => (
					<NavLink
						key={link.to}
						to={link.to}
						end={link.end}
						onClick={onNavigate}
						className={({ isActive }) =>
							cn(linkBase, isActive && linkActive)
						}>
						{link.label}
					</NavLink>
				))}

				<button
					type="button"
					onClick={handleLogout}
					className={cn(linkBase, "w-full justify-start border-0 bg-transparent text-left")}>
					Logout
				</button>
			</div>
		</nav>
	);
}

export default Sidebar;
