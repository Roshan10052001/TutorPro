import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { AuthContext } from "../context";
import { useGetBookings, useUpdateBookingStatus } from "../hooks/booking";
import { useGetMyReviews } from "../hooks/review";
import ReviewDialog from "../components/ReviewDialog";
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
	const { data: myReviews = [] } = useGetMyReviews();
	const { mutate: updateStatus, isPending: isUpdatingStatus } =
		useUpdateBookingStatus();
	const reviewedBookingIds = useMemo(
		() =>
			new Set(
				(myReviews || [])
					.map((review) => review.booking?.toString?.() || review.booking)
					.filter(Boolean),
			),
		[myReviews],
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [reviewTarget, setReviewTarget] = useState(null);
	const [pendingDecision, setPendingDecision] = useState(null);
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
			...(effectiveRole === "tutor"
				? [
						{
							key: "actions",
							header: "Actions",
							render: (session) => {
								if (session.status !== "pending") return "—";
								return (
									<button
										type='button'
										className='secondary-btn'
										onClick={() => setPendingDecision(session)}>
										Review request
									</button>
								);
							},
						},
					]
				: []),
			...(effectiveRole === "student"
				? [
						{
							key: "review",
							header: "Review",
							render: (session) => {
								if (session.status !== "completed") return "—";
								if (reviewedBookingIds.has(session._id))
									return <span className='muted-text'>Reviewed</span>;
								return (
									<button
										type='button'
										className='secondary-btn'
										onClick={() => setReviewTarget(session)}>
										Leave review
									</button>
								);
							},
						},
					]
				: []),
		],
		[effectiveRole, reviewedBookingIds],
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

	const handleDecision = (status) => {
		if (!pendingDecision) return;
		updateStatus(
			{ bookingId: pendingDecision._id, status },
			{ onSuccess: () => setPendingDecision(null) },
		);
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

			<Modal
				isOpen={Boolean(pendingDecision)}
				onClose={() => (isUpdatingStatus ? null : setPendingDecision(null))}
				title='Session Request'
				size='md'
				footer={
					<>
						<button
							type='button'
							className='secondary-btn'
							disabled={isUpdatingStatus}
							onClick={() => handleDecision("cancelled")}>
							Reject
						</button>
						<button
							type='button'
							className='primary-btn'
							disabled={isUpdatingStatus}
							onClick={() => handleDecision("confirmed")}>
							Approve
						</button>
					</>
				}>
				{pendingDecision ? (
					<div>
						<p>
							<strong>Student:</strong>{" "}
							{pendingDecision.student?.name || "Unknown"}
						</p>
						<p>
							<strong>Course:</strong> {pendingDecision.course || "-"}
						</p>
						<p>
							<strong>Date:</strong>{" "}
							{pendingDecision.date
								? new Date(pendingDecision.date).toLocaleDateString()
								: "-"}
						</p>
						<p>
							<strong>Time:</strong> {pendingDecision.startTime} -{" "}
							{pendingDecision.endTime}
						</p>
						<p>
							<strong>Notes:</strong> {pendingDecision.notes || "No notes"}
						</p>
						<p>Approve or reject this session request?</p>
					</div>
				) : null}
			</Modal>

			<ReviewDialog
				isOpen={Boolean(reviewTarget)}
				onClose={() => setReviewTarget(null)}
				booking={reviewTarget}
			/>
		</Layout>
	);
}

export default Sessions;
