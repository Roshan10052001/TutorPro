import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { AuthContext } from "../context";
import { useGetBookings } from "../hooks/booking";
import BookingForm from "./BookSession/BookingForm";
import { convertTimeToMinutes } from "../utils/functions";

function Sessions() {
	const { user, role, activeView, effectiveRole } = useContext(AuthContext);
	const bookingParams =
		role === "tutor"
			? { view: activeView === "student" ? "student" : "tutor" }
			: {};
	const { data: sessions = [], isPending: isSessionsLoading } =
		useGetBookings(bookingParams);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	const requestedTutorId = location.state?.tutorId || "";

	const sidebarRole =
		effectiveRole === "admin"
			? "Admin"
			: effectiveRole === "tutor"
				? "Tutor"
				: "Student";

	const filteredSessions = useMemo(() => {
		if (effectiveRole === "student") {
			return sessions.filter(
				(session) => session.student?._id?.toString() === user?.id?.toString(),
			);
		}

		if (effectiveRole === "tutor") {
			return sessions.filter(
				(session) => session.tutor?._id?.toString() === user?.id?.toString(),
			);
		}

		return sessions;
	}, [sessions, user?.id, effectiveRole]);

	const sortedSessions = useMemo(() => {
		const getSessionDateTime = (session) => {
			if (!session?.date) return 0;

			const sessionDate = new Date(session.date);
			const startMinutes = convertTimeToMinutes(
				session.startTime || "12:00 AM",
			);

			sessionDate.setHours(
				Math.floor(startMinutes / 60),
				startMinutes % 60,
				0,
				0,
			);

			return sessionDate.getTime();
		};

		return [...filteredSessions].sort(
			(firstSession, secondSession) =>
				getSessionDateTime(firstSession) - getSessionDateTime(secondSession),
		);
	}, [filteredSessions]);

	const columns = useMemo(
		() => [
			{
				key: "tutor",
				header: "Tutor",
				render: (session) => session.tutor?.name || "Unknown",
			},
			{
				key: "student",
				header: "Student",
				render: (session) => session.student?.name || "Unknown",
			},
			{
				key: "course",
				header: "Course",
			},
			{
				key: "date",
				header: "Date",
				render: (session) =>
					session.date
						? new Date(session.date).toLocaleDateString(undefined, {
								weekday: "short",
								month: "short",
								day: "numeric",
								year: "numeric",
							})
						: "-",
			},
			{
				key: "time",
				header: "Time",
				render: (session) =>
					session.startTime && session.endTime
						? `${session.startTime} - ${session.endTime}`
						: "-",
			},
			{
				key: "status",
				header: "Status",
				render: (session) => (
					<span className={`status-badge ${session.status || "pending"}`}>
						{session.status || "pending"}
					</span>
				),
			},
			{
				key: "notes",
				header: "Notes",
				render: (session) => session.notes || "No notes",
			},
		],
		[],
	);

	const pageTitle =
		effectiveRole === "admin"
			? "All Sessions"
			: effectiveRole === "tutor"
				? "Tutor Sessions"
				: "My Sessions";

	const pageSubtitle =
		effectiveRole === "student"
			? "Review your booked sessions and reserve a new one when you need help."
			: effectiveRole === "tutor"
				? "Track the sessions students have scheduled with you."
				: "Monitor all tutoring sessions happening across the platform.";

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		if (location.state) {
			navigate(location.pathname, { replace: true, state: null });
		}
	};

	useEffect(() => {
		if (effectiveRole !== "student") return;
		if (!location.state?.openBooking) return;

		setIsModalOpen(true);
	}, [location.state, effectiveRole]);

	return (
		<Layout
			page={sidebarRole}
			title={pageTitle}
			subtitle={pageSubtitle}
			buttonText={effectiveRole === "student" ? "Book New Session" : undefined}
			onButtonClick={effectiveRole === "student" ? handleOpenModal : undefined}>
			<section className='dashboard-panel enhanced-panel'>
				<h2>Session List</h2>
				<DataTable
					columns={columns}
					data={sortedSessions}
					isLoading={isSessionsLoading}
					emptyTitle='No sessions yet'
					emptyText={
						effectiveRole === "student"
							? 'Click "Book New Session" to schedule your first tutoring session.'
							: "There are no sessions to show right now."
					}
				/>
			</section>

			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title='Book New Session'
				size='lg'>
				<BookingForm
					initialTutorId={requestedTutorId}
					onSuccess={handleCloseModal}
					onCancel={handleCloseModal}
				/>
			</Modal>
		</Layout>
	);
}

export default Sessions;
