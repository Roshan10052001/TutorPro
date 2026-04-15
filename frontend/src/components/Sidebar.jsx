import { Link } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar({ role }) {
	return (
		<aside className='sidebar'>
			<h3>{role} Panel</h3>

			<Link to='/'>Home</Link>

			{role === "Student" && (
				<>
					<Link to='/student/dashboard'>Dashboard</Link>
					<Link to='/student/tutors'>Find Tutors</Link>
					<Link to='/student/tutor-apply'>Become a Tutor</Link>
					<Link to='/student/book-session'>Book Session</Link>
					<Link to='/student/sessions'>My Sessions</Link>
					<Link to='/student/profile'>Profile</Link>
				</>
			)}

			{role === "Tutor" && (
				<>
					<Link to='/tutor/dashboard'>Dashboard</Link>
					{/* <Link to='/tutor-apply'>Apply as Tutor</Link> */}
					<Link to='/tutor/sessions'>My Sessions</Link>
					<Link to='/tutor/profile'>Profile</Link>
				</>
			)}

			{role === "Admin" && (
				<>
					<Link to='/admin/dashboard'>Dashboard</Link>
					{/* <Link to='/sessions'>All Sessions</Link>
					<Link to='/profile'>Profile</Link> */}
				</>
			)}

			<Link to='/logout'>Logout</Link>
		</aside>
	);
}

export default Sidebar;
