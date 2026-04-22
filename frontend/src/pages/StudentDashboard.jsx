import { useNavigate } from "react-router-dom";
import { useMemo, useContext } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import SessionCard from "../components/SessionCard";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useGetTutors } from "../hooks/tutor";
import { useGetBookings } from "../hooks/booking";
import { AuthContext } from "../context";
import { convertTimeToMinutes } from "../utils/functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function StudentDashboard() {
	const navigate = useNavigate();
	const { user, role } = useContext(AuthContext);
	const { data: tutors = [] } = useGetTutors();
	const { data: sessions = [], isPending: isSessionsLoading } = useGetBookings(
		role === "tutor" ? { view: "student" } : {}
	);

	const approvedTutors = tutors.filter((tutor) => tutor.status === "approved");

	const studentSessions = useMemo(
		() =>
			sessions.filter(
				(session) => session.student?._id?.toString() === user?.id?.toString()
			),
		[sessions, user?.id]
	);

	const getSessionDateTime = (session) => {
		if (!session?.date) return 0;
		const sessionDate = new Date(session.date);
		const startMinutes = convertTimeToMinutes(session.startTime || "12:00 AM");
		sessionDate.setHours(
			Math.floor(startMinutes / 60),
			startMinutes % 60,
			0,
			0
		);
		return sessionDate.getTime();
	};

	const upcomingSessions = useMemo(() => {
		return [...studentSessions]
			.sort((a, b) => getSessionDateTime(a) - getSessionDateTime(b))
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
			page="Student"
			title="Student Dashboard"
			subtitle="Find approved tutors, book slots, and manage your sessions."
			buttonText="Book a Session"
			onButtonClick={() =>
				navigate("/student/sessions", { state: { openBooking: true } })
			}>
			<section className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				<StatCard
					title="Approved Tutors"
					value={approvedTutors.length}
					subtitle="Available to book"
				/>
				<StatCard
					title="My Sessions"
					value={studentSessions.length}
					subtitle="Current bookings"
				/>
				<StatCard
					title="Open Booking Flow"
					value="Active"
					subtitle="Tutor slot based"
				/>
			</section>

			<Card className="mb-6">
				<CardContent className="p-6">
					<h2 className="mb-4 text-lg font-bold text-slate-900">
						My Upcoming Sessions
					</h2>
					{isSessionsLoading ? (
						<Loader />
					) : upcomingSessions.length === 0 ? (
						<EmptyState
							title="No sessions booked yet"
							text="Browse tutors and book your first session when you are ready."
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
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-6">
					<h2 className="mb-4 text-lg font-bold text-slate-900">
						Quick Actions
					</h2>
					<div className="grid gap-3 sm:grid-cols-3">
						<Button
							variant="outline"
							onClick={() => navigate("/student/tutors")}>
							Browse Tutors
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								navigate("/student/sessions", {
									state: { openBooking: true },
								})
							}>
							Book by Slot
						</Button>
						<Button
							variant="outline"
							onClick={() => navigate("/student/sessions")}>
							View Sessions
						</Button>
					</div>
				</CardContent>
			</Card>
		</Layout>
	);
}

export default StudentDashboard;
