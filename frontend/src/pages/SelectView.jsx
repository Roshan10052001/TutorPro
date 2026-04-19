import { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context";
import { getDashboardPath } from "../routes/path";
import "../styles/auth.css";

function SelectView() {
	const navigate = useNavigate();
	const { user, activeView, switchView } = useContext(AuthContext);

	if (!user) {
		return (
			<Navigate
				to='/signin'
				replace
			/>
		);
	}

	if (user.role === "student" || user.role === "admin") {
		return (
			<Navigate
				to={getDashboardPath(user.role, activeView)}
				replace
			/>
		);
	}

	const handleContinue = (nextView) => {
		switchView(nextView);
		navigate(getDashboardPath(user.role, nextView), { replace: true });
	};

	return (
		<div className='page-shell'>
			<Navbar />

			<main className='auth-page'>
				<div className='auth-card glass-card'>
					<h1>Choose Your View</h1>
					<p>Select how you want to continue in Tutor Pro today.</p>

					<div className='action-grid'>
						<button
							type='button'
							className='primary-btn'
							onClick={() => handleContinue("tutor")}>
							Continue as Tutor
						</button>

						<button
							type='button'
							className='secondary-btn'
							onClick={() => handleContinue("student")}>
							Continue as Student
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}

export default SelectView;
