import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context";
import Swal from "sweetalert2";
import { getDashboardPath } from "../routes/path";
import { Button } from "@/components/ui/button";

function Navbar() {
	const { role, activeView, effectiveRole, isAuthenticated, logout } =
		useContext(AuthContext);
	const navigate = useNavigate();

	const dashboardPath = getDashboardPath(role, activeView);

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
		navigate("/signin");
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/75 backdrop-blur-lg">
			<div className="mx-auto flex min-h-[78px] max-w-7xl flex-col items-start gap-4 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-6">
				<Link
					to="/"
					className="flex items-center gap-3">
					<div className="grid h-[42px] w-[42px] place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 font-extrabold text-white shadow-lg shadow-blue-500/25">
						TP
					</div>
					<h2 className="text-xl font-extrabold tracking-tight text-slate-900">
						Tutor Pro
					</h2>
				</Link>

				<nav className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
					<Link
						to="/"
						className="rounded-full px-3.5 py-2.5 font-semibold text-slate-600 transition hover:bg-white/90 hover:text-blue-700">
						Home
					</Link>

					{isAuthenticated ? (
						<>
							<Link
								to={dashboardPath}
								className="rounded-full px-3.5 py-2.5 font-semibold text-slate-600 transition hover:bg-white/90 hover:text-blue-700">
								Dashboard
							</Link>
							{effectiveRole === "student" ? (
								<Link
									to="/student/sessions"
									className="rounded-full px-3.5 py-2.5 font-semibold text-slate-600 transition hover:bg-white/90 hover:text-blue-700">
									Sessions
								</Link>
							) : (
								effectiveRole === "tutor" && (
									<Link
										to="/tutor/sessions"
										className="rounded-full px-3.5 py-2.5 font-semibold text-slate-600 transition hover:bg-white/90 hover:text-blue-700">
										Sessions
									</Link>
								)
							)}
							{effectiveRole === "student" ? (
								<Link
									to="/student/profile"
									className="rounded-full px-3.5 py-2.5 font-semibold text-slate-600 transition hover:bg-white/90 hover:text-blue-700">
									Profile
								</Link>
							) : (
								effectiveRole === "tutor" && (
									<Link
										to="/tutor/profile"
										className="rounded-full px-3.5 py-2.5 font-semibold text-slate-600 transition hover:bg-white/90 hover:text-blue-700">
										Profile
									</Link>
								)
							)}
						</>
					) : (
						<>
							<Link
								to="/signin"
								className="rounded-full px-3.5 py-2.5 font-semibold text-slate-600 transition hover:bg-white/90 hover:text-blue-700">
								Sign In
							</Link>
							<Link
								to="/signup"
								className="rounded-full px-3.5 py-2.5 font-semibold text-slate-600 transition hover:bg-white/90 hover:text-blue-700">
								Sign Up
							</Link>
						</>
					)}
				</nav>

				<div className="inline-flex items-center gap-2.5">
					{isAuthenticated ? (
						<Button onClick={handleLogout}>Logout</Button>
					) : (
						<Button asChild>
							<Link to="/signin">Get Started</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}

export default Navbar;
