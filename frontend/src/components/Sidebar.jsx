import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context";
import { getDashboardPath } from "../routes/path";
import "../styles/sidebar.css";

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
			className='sidebar'
			aria-label={`${role} navigation`}>
			<div className='sidebar-brand'>
				<div className='sidebar-brand-top'>
					<div className='sidebar-logo-mark'>TP</div>
					<div>
						<h3>{name || `${role} Panel`}</h3>
						<p>TutorPro</p>
					</div>
				</div>

				{canSwitchView ? (
					<div className='sidebar-mode-switcher'>
						<span className='sidebar-mode-label'>
							Current view: {activeView === "student" ? "Student" : "Tutor"}
						</span>
						<div className='sidebar-mode-actions'>
							<button
								type='button'
								className={`sidebar-mode-btn${activeView === "student" ? " active" : ""}`}
								onClick={() => handleSwitchView("student")}>
								Student View
							</button>
							<button
								type='button'
								className={`sidebar-mode-btn${activeView === "tutor" ? " active" : ""}`}
								onClick={() => handleSwitchView("tutor")}>
								Tutor View
							</button>
						</div>
					</div>
				) : null}
			</div>

			<div className='sidebar-links'>
				{links.map((link) => (
					<NavLink
						key={link.to}
						to={link.to}
						end={link.end}
						onClick={onNavigate}
						className={({ isActive }) =>
							`sidebar-link${isActive ? " active" : ""}`
						}>
						{link.label}
					</NavLink>
				))}

				<button
					type='button'
					onClick={handleLogout}
					className='sidebar-link sidebar-link-button'>
					Logout
				</button>
			</div>
		</nav>
	);
}

export default Sidebar;
