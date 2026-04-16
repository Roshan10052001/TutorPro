import Sidebar from "../components/Sidebar";
import SessionCard from "../components/SessionCard";
import EmptyState from "../components/EmptyState";
import { useGetTutors } from "../hooks/tutor";
import { useContext } from "react";
import { AuthContext } from "../context";

function Sessions() {
	const sessions = [];
	const { data: tutors = [] } = useGetTutors();
	const { user } = useContext(AuthContext);

	const sidebarRole =
		user?.role === "admin"
			? "Admin"
			: user?.role === "tutor"
				? "Tutor"
				: "Student";

	const myTutorProfile = tutors?.find(
		(tutor) =>
			tutor.email.trim().toLowerCase() === user?.email.trim().toLowerCase(),
	);

	let filteredSessions = sessions;

	if (user?.role === "student") {
		filteredSessions = sessions.filter(
			(session) =>
				session.studentEmail.trim().toLowerCase() ===
				user?.email.trim().toLowerCase(),
		);
	}

	if (user?.role === "tutor") {
		filteredSessions = myTutorProfile
			? sessions.filter((session) => session.tutor === myTutorProfile.name)
			: [];
	}

	return (
		<div className='dashboard-layout'>
			<Sidebar role={sidebarRole} />

			<main className='dashboard-main'>
				<div className='dashboard-header'>
					<div>
						<h1>
							{user?.role === "admin"
								? "All Sessions"
								: user?.role === "tutor"
									? "Tutor Sessions"
									: "My Sessions"}
						</h1>
						<p>View the session list based on your role.</p>
					</div>
				</div>

				<section className='dashboard-panel enhanced-panel'>
					<h2>Session List</h2>
					{filteredSessions.length === 0 ? (
						<EmptyState
							title='No sessions available'
							text='Your session list is empty right now.'
						/>
					) : (
						filteredSessions.map((session) => (
							<SessionCard
								key={session.id}
								course={session.course}
								tutor={
									user?.role === "student"
										? `Tutor: ${session.tutor}`
										: `Student: ${session.student}`
								}
								time={session.time}
								status={session.status}
							/>
						))
					)}
				</section>
			</main>
		</div>
	);
}

export default Sessions;
