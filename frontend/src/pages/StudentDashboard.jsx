import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import SessionCard from "../components/SessionCard";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useGetTutors } from "../hooks/tutor";
import { useGetBookings } from "../hooks/booking";
import { useContext } from "react";
import { AuthContext } from "../context";
import { convertTimeToMinutes } from "../utils/functions";

function StudentDashboard() {
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	const { data: tutors = [] } = useGetTutors();
	const { data: sessions = [], isPending: isSessionsLoading } =
		useGetBookings();

	const approvedTutors = tutors.filter((tutor) => tutor.status === "approved");

	const studentSessions = useMemo(
		() =>
			sessions.filter(
				(session) => session.student?._id?.toString() === user?.id?.toString(),
			),
		[sessions, user?.id],
	);

	const getSessionDateTime = (session) => {
		if (!session?.date) return 0;

		const sessionDate = new Date(session.date);
		const startMinutes = convertTimeToMinutes(session.startTime || "12:00 AM");

		sessionDate.setHours(
			Math.floor(startMinutes / 60),
			startMinutes % 60,
			0,
			0,
		);

		return sessionDate.getTime();
	};

	const upcomingSessions = useMemo(() => {
		return [...studentSessions]
			.sort((firstSession, secondSession) => {
				return getSessionDateTime(firstSession) - getSessionDateTime(secondSession);
			})
			.slice(0, 3);
	}, [studentSessions]);

	const formatSessionTime = (session) => {
		if (!session?.date) {
			return `${session?.startTime || ""} - ${session?.endTime || ""}`.trim();
		}

		const sessionDate = new Date(session.date);
		const readableDate = sessionDate.toLocaleDateString(undefined, {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});

		return `${readableDate} • ${session.startTime} - ${session.endTime}`;
	};

	return (
		<Layout
			page='Student'
			title='Student Dashboard'
			subtitle='Find approved tutors, book slots, and manage your sessions.'
			buttonText='Book a Session'
			onButtonClick={() =>
				navigate("/student/sessions", {
					state: { openBooking: true },
				})
			}>
			<section className='stats-grid'>
				<StatCard
					title='Approved Tutors'
					value={approvedTutors.length}
					subtitle='Available to book'
				/>
				<StatCard
					title='My Sessions'
					value={studentSessions.length}
					subtitle='Current bookings'
				/>
				<StatCard
					title='Open Booking Flow'
					value='Active'
					subtitle='Tutor slot based'
				/>
			</section>

			<section className='dashboard-panel'>
				<h2>My Upcoming Sessions</h2>
				{isSessionsLoading ? (
					<Loader />
				) : upcomingSessions.length === 0 ? (
					<EmptyState
						title='No sessions booked yet'
						text='Browse tutors and book your first session when you are ready.'
					/>
				) : (
					upcomingSessions.map((session) => (
						<SessionCard
							key={session._id}
							course={session.course}
							tutor={`Tutor: ${session.tutor?.name || "Unknown"}`}
							time={formatSessionTime(session)}
							status={session.status || "pending"}
						/>
					))
				)}
			</section>

			<section className='dashboard-panel'>
				<h2>Quick Actions</h2>
				<div className='action-grid'>
					<button
						className='secondary-btn'
						onClick={() => navigate("/student/tutors")}>
						Browse Tutors
					</button>
					<button
						className='secondary-btn'
						onClick={() =>
							navigate("/student/sessions", {
								state: { openBooking: true },
							})
						}>
						Book by Slot
					</button>
					<button
						className='secondary-btn'
						onClick={() => navigate("/student/sessions")}>
						View Sessions
					</button>
				</div>
			</section>
		</Layout>
	);
}

export default StudentDashboard;
