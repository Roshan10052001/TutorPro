import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { AuthContext } from "../context";
import {
	useGetBookings,
	useUpdateBookingStatus,
	useCancelBooking,
} from "../hooks/booking";
import BookingForm from "./BookSession/BookingForm";
import { convertTimeToMinutes } from "../utils/functions";
import Swal from "sweetalert2";

function Sessions() {
	const { user, role, activeView, effectiveRole } = useContext(AuthContext);
	const bookingParams =
		role === "tutor"
			? { view: activeView === "student" ? "student" : "tutor" }
			: {};

	const { data: sessions = [], isPending: isSessionsLoading } =
		useGetBookings(bookingParams);

	const updateBookingStatusMutation = useUpdateBookingStatus();
	const cancelBookingMutation = useCancelBooking();

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

	const handleStatusUpdate = (bookingId, status) => {
		updateBookingStatusMutation.mutate({
			bookingId,
			status,
		});
	};

	const handleCancelBooking = (bookingId) => {
		cancelBookingMutation.mutate(bookingId);
	};

	const handleSessionAction = async (bookingId, action) => {
		const actionLabels = {
			confirmed: "confirm this booking",
			completed: "mark this booking as completed",
			cancelled: "cancel this booking",
		};

		const result = await Swal.fire({
			title: "Confirmation",
			text: `Are you sure you want to ${actionLabels[action]}?`,
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "Cancel",
			reverseButtons: true,
		});

		if (!result.isConfirmed) return;

		if (action === "cancelled") {
			handleCancelBooking(bookingId);
		} else {
			handleStatusUpdate(bookingId, action);
		}
	};

	const getStatusMeta = (status) => {
		const normalizedStatus = (status || "pending").toLowerCase();

		const statusMap = {
			pending: {
				label: "Pending",
				className: "pending",
			},
			confirmed: {
				label: "Confirmed",
				className: "confirmed",
			},
			completed: {
				label: "Completed",
				className: "completed",
			},
			cancelled: {
				label: "Cancelled",
				className: "cancelled",
			},
		};

		return (
			statusMap[normalizedStatus] || {
				label: normalizedStatus,
				className: normalizedStatus,
			}
		);
	};

	const getAvailableActions = (status) => {
		const normalizedStatus = (status || "pending").toLowerCase();

		const actionMap = {
			pending: [
				{ value: "confirmed", label: "Mark as Confirmed" },
				{ value: "cancelled", label: "Cancel Booking" },
			],
			confirmed: [
				{ value: "completed", label: "Mark as Completed" },
				{ value: "cancelled", label: "Cancel Booking" },
			],
			completed: [],
			cancelled: [],
		};

		return actionMap[normalizedStatus] || [];
	};

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
				render: (session) => {
					const statusMeta = getStatusMeta(session.status);

					return (
						<span className={`status-badge ${statusMeta.className}`}>
							{statusMeta.label}
						</span>
					);
				},
			},
			{
				key: "notes",
				header: "Notes",
				render: (session) => session.notes || "No notes",
			},
			...(effectiveRole === "tutor" || effectiveRole === "admin"
				? [
						{
							key: "actions",
							header: "Actions",
							render: (session) => {
								const availableActions = getAvailableActions(session.status);
								const isBusy =
									updateBookingStatusMutation.isPending ||
									cancelBookingMutation.isPending;

								if (availableActions.length === 0) {
									return (
										<span
											style={{
												color: "#6b7280",
												fontSize: "0.9rem",
												fontWeight: 500,
											}}>
											No actions available
										</span>
									);
								}

								return (
									<select
										defaultValue=""
										disabled={isBusy}
										style={{
											padding: "8px 10px",
											borderRadius: "8px",
											border: "1px solid #d1d5db",
											backgroundColor: "#fff",
											minWidth: "180px",
											cursor: isBusy ? "not-allowed" : "pointer",
										}}
										onChange={async (event) => {
											const selectedValue = event.target.value;

											if (!selectedValue) return;

											await handleSessionAction(session._id, selectedValue);
											event.target.value = "";
										}}>
										<option value="">
											{isBusy ? "Updating..." : "Choose action"}
										</option>

										{availableActions.map((action) => (
											<option
												key={action.value}
												value={action.value}>
												{action.label}
											</option>
										))}
									</select>
								);
							},
						},
					]
				: []),
		],
		[
			effectiveRole,
			updateBookingStatusMutation.isPending,
			cancelBookingMutation.isPending,
		],
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