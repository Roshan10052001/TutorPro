import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { useContext } from "react";
import { AuthContext } from "../context";
import Swal from "sweetalert2";

function Navbar() {
	const { role, isAuthenticated, logout } = useContext(AuthContext);
	const navigate = useNavigate();

	const dashboardPath =
		role === "admin"
			? "/admin/dashboard"
			: role === "tutor"
				? "/tutor/dashboard"
				: "/student/dashboard";

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
		<header className='navbar'>
			<div className='navbar-container'>
				<Link
					to='/'
					className='navbar-logo'>
					<div className='logo-mark'>TP</div>
					<h2>Tutor Pro</h2>
				</Link>

				<nav className='navbar-links'>
					<Link to='/'>Home</Link>

					{isAuthenticated ? (
						<>
							<Link to={dashboardPath}>Dashboard</Link>
							{/* {role === "student" && <Link to='/student/tutors'>Tutors</Link>}
							{role === "tutor" && <Link to='/tutor/apply'>Apply</Link>} */}
							{role === "student" ? (
								<Link to='/student/sessions'>Sessions</Link>
							) : (
								role === "tutor" && <Link to='/tutor/sessions'>Sessions</Link>
							)}
							{role === "student" ? (
								<Link to='/student/profile'>Profile</Link>
							) : (
								role === "tutor" && <Link to='/tutor/profile'>Profile</Link>
							)}
						</>
					) : (
						<>
							<Link to='/signin'>Sign In</Link>
							<Link to='/signup'>Sign Up</Link>
						</>
					)}
				</nav>

				<div className='navbar-cta'>
					{isAuthenticated ? (
						<button
							type='button'
							onClick={handleLogout}
							className='primary-btn'>
							Logout
						</button>
					) : (
						<Link
							to='/signin'
							className='primary-btn'>
							Get Started
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}

export default Navbar;
