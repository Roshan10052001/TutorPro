import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import SessionCard from "../components/SessionCard";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { useGetTutors } from "../hooks/tutor";
import { useGetBookings } from "../hooks/booking";
import { useUpdateMyTutorAvailability } from "../hooks/tutorApplication";
import { useContext } from "react";
import { AuthContext } from "../context";
import {
	convertMinutesToTime,
	convertTimeToMinutes,
	getNextDateForDay,
} from "../utils/functions";
import { DAYS, HOURS, MINUTES, PERIODS, warnAlert } from "../utils";

function TutorDashboard() {
	const navigate = useNavigate();
	const { data: tutors = [] } = useGetTutors();
	const { data: sessions = [], isPending: isSessionsLoading } =
		useGetBookings();
	const {
		mutateAsync: updateTutorAvailability,
		isPending: isUpdatingAvailability,
		reset: resetAvailabilityUpdate,
	} = useUpdateMyTutorAvailability();
	const { user } = useContext(AuthContext);
	const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
	const [selectedProfileId, setSelectedProfileId] = useState("");
	const [availability, setAvailability] = useState([]);
	const [editingIndex, setEditingIndex] = useState(null);
	const [slotForm, setSlotForm] = useState({
		day: "",
		hour: "",
		minute: "00",
		period: "AM",
		endHour: "",
		endMinute: "00",
		endPeriod: "AM",
		sessionLengthMinutes: "60",
	});

	const formatAvailabilitySlot = (slot) => {
		if (!slot || typeof slot !== "object") return String(slot || "-");

		return `${slot.day}: ${slot.startTime} - ${slot.endTime} • ${slot.sessionLengthMinutes} min sessions`;
	};

	const getWindowSlotCount = (slot) => {
		const startMinutes = convertTimeToMinutes(slot.startTime);
		const endMinutes = convertTimeToMinutes(slot.endTime);
		const sessionLength = Number(slot.sessionLengthMinutes || 60);

		return Math.max(0, Math.floor((endMinutes - startMinutes) / sessionLength));
	};

	const myTutorProfiles = tutors.filter(
		(tutor) =>
			tutor.email.trim().toLowerCase() === user?.email.trim().toLowerCase(),
	);
	const myTutorProfile =
		myTutorProfiles.find((profile) => profile._id === selectedProfileId) ||
		myTutorProfiles[0] ||
		null;

	const mySessions = sessions.filter(
		(session) => session.tutor?._id?.toString() === user?.id?.toString(),
	);

	const getSessionDateTime = (session) => {
		if (!session?.date) return null;

		const sessionDate = new Date(session.date);
		const startMinutes = convertTimeToMinutes(session.startTime || "12:00 AM");

		sessionDate.setHours(
			Math.floor(startMinutes / 60),
			startMinutes % 60,
			0,
			0,
		);

		return sessionDate;
	};

	const totalOpenAvailabilitySlots = myTutorProfiles.reduce(
		(count, profile) => {
			const labels = new Set(
				(profile.bookedSlots || []).map((slot) => slot.label),
			);

			const profileOpenSlots = (profile.availability || []).reduce(
				(slotCount, slot) => {
					const startMinutes = convertTimeToMinutes(slot.startTime);
					const endMinutes = convertTimeToMinutes(slot.endTime);
					const sessionLength = Number(slot.sessionLengthMinutes || 60);
					let generatedCount = 0;

					for (
						let current = startMinutes;
						current + sessionLength <= endMinutes;
						current += sessionLength
					) {
						const sessionStart = convertMinutesToTime(current);
						const sessionEnd = convertMinutesToTime(current + sessionLength);
						const label = `${slot.day} - ${sessionStart} to ${sessionEnd}`;

						if (!labels.has(label)) {
							generatedCount += 1;
						}
					}

					return slotCount + generatedCount;
				},
				0,
			);

			return count + profileOpenSlots;
		},
		0,
	);

	const upcomingSessions = [...mySessions]
		.sort(
			(firstSession, secondSession) =>
				getSessionDateTime(firstSession) - getSessionDateTime(secondSession),
		)
		.slice(0, 5);

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

	const resetSlotForm = () => {
		setSlotForm({
			day: "",
			hour: "",
			minute: "00",
			period: "AM",
			endHour: "",
			endMinute: "00",
			endPeriod: "AM",
			sessionLengthMinutes: "60",
		});
		setEditingIndex(null);
	};

	const handleSlotChange = (event) => {
		setSlotForm((prev) => ({
			...prev,
			[event.target.name]: event.target.value,
		}));
	};

	const handleOpenAvailabilityModal = () => {
		if (myTutorProfiles.length === 0) {
			navigate("/tutor-apply");
			return;
		}

		const initialProfile = myTutorProfiles[0];
		setSelectedProfileId(initialProfile._id);
		setAvailability(initialProfile.availability || []);
		resetSlotForm();
		setIsAvailabilityModalOpen(true);
	};

	const handleCloseAvailabilityModal = () => {
		setIsAvailabilityModalOpen(false);
		setSelectedProfileId("");
		setAvailability([]);
		resetSlotForm();
		resetAvailabilityUpdate();
	};

	const handleProfileSelection = (event) => {
		const nextProfileId = event.target.value;
		const nextProfile = myTutorProfiles.find(
			(profile) => profile._id === nextProfileId,
		);

		setSelectedProfileId(nextProfileId);
		setAvailability(nextProfile?.availability || []);
		resetSlotForm();
	};

	const buildAvailabilitySlot = () => ({
		day: slotForm.day,
		startTime: `${slotForm.hour}:${slotForm.minute} ${slotForm.period}`,
		endTime: `${slotForm.endHour}:${slotForm.endMinute} ${slotForm.endPeriod}`,
		sessionLengthMinutes: Number(slotForm.sessionLengthMinutes),
	});

	const handleAddAvailability = () => {
		if (
			!slotForm.day ||
			!slotForm.hour ||
			!slotForm.minute ||
			!slotForm.period ||
			!slotForm.endHour ||
			!slotForm.endMinute ||
			!slotForm.endPeriod ||
			!slotForm.sessionLengthMinutes
		) {
			warnAlert("Please complete the full availability range.");
			return;
		}

		const slot = buildAvailabilitySlot();
		const startMinutes = convertTimeToMinutes(slot.startTime);
		const endMinutes = convertTimeToMinutes(slot.endTime);

		if (endMinutes <= startMinutes) {
			warnAlert("End time must be later than start time.");
			return;
		}

		if (endMinutes - startMinutes < slot.sessionLengthMinutes) {
			warnAlert(
				"Session length cannot be longer than the selected time range.",
			);
			return;
		}

		const duplicateExists = availability.some(
			(existingSlot, index) =>
				existingSlot.day === slot.day &&
				existingSlot.startTime === slot.startTime &&
				existingSlot.endTime === slot.endTime &&
				existingSlot.sessionLengthMinutes === slot.sessionLengthMinutes &&
				index !== editingIndex,
		);

		if (duplicateExists) {
			warnAlert("That availability slot has already been added.");
			return;
		}

		if (editingIndex !== null) {
			setAvailability((prev) =>
				prev.map((item, index) => (index === editingIndex ? slot : item)),
			);
		} else {
			setAvailability((prev) => [...prev, slot]);
		}

		resetSlotForm();
	};

	const handleEditAvailability = (index) => {
		const slot = availability[index];
		const [startTime, startPeriod] = slot.startTime.split(" ");
		const [startHour, startMinute] = startTime.split(":");
		const [endTime, endPeriod] = slot.endTime.split(" ");
		const [endHour, endMinute] = endTime.split(":");

		setSlotForm({
			day: slot.day || "",
			hour: startHour || "",
			minute: startMinute || "00",
			period: startPeriod || "AM",
			endHour: endHour || "",
			endMinute: endMinute || "00",
			endPeriod: endPeriod || "AM",
			sessionLengthMinutes: String(slot.sessionLengthMinutes || 60),
		});
		setEditingIndex(index);
	};

	const handleRemoveAvailability = (indexToRemove) => {
		setAvailability((prev) =>
			prev.filter((_, index) => index !== indexToRemove),
		);

		if (editingIndex === indexToRemove) {
			resetSlotForm();
		}
	};

	const handleSaveAvailability = async () => {
		if (availability.length === 0) {
			warnAlert("Please add at least one availability slot.");
			return;
		}

		try {
			await updateTutorAvailability({
				applicationId: selectedProfileId,
				availability,
			});
			handleCloseAvailabilityModal();
		} catch {
			// handled in hook
		}
	};

	return (
		<Layout
			page='Tutor'
			title='Tutor Dashboard'
			subtitle='Manage your tutor profile, availability, and student bookings.'
			headerAction={
				<div
					style={{
						display: "flex",
						gap: "12px",
						flexWrap: "wrap",
					}}>
					<button
						type='button'
						className='secondary-btn'
						onClick={() =>
							navigate("/tutor/tutor-apply", {
								state: { openNewApplication: true },
							})
						}>
						Apply for Another Course
					</button>
					<button
						type='button'
						className='primary-btn'
						onClick={handleOpenAvailabilityModal}>
						{myTutorProfile ? "Update Availability" : "Apply as Tutor"}
					</button>
				</div>
			}>
			<section className='stats-grid'>
				<StatCard
					title='Approval Status'
					value={
						myTutorProfiles.length > 0 ? "Approved" : "Pending / Not Approved"
					}
					subtitle='Admin controlled'
				/>
				<StatCard
					title='My Sessions'
					value={mySessions.length}
					subtitle='Booked by students'
				/>
				<StatCard
					title='Open Session Slots'
					value={totalOpenAvailabilitySlots}
					subtitle='Currently bookable'
				/>
			</section>

			<section className='dashboard-panel enhanced-panel'>
				<h2>My Tutor Status</h2>
				{myTutorProfiles.length > 0 ? (
					myTutorProfiles.map((profile) => {
						const profileBookedLabels = new Set(
							(profile.bookedSlots || []).map((slot) => slot.label),
						);
						const profileOpenSlots = (profile.availability || []).flatMap(
							(slot) => {
								const startMinutes = convertTimeToMinutes(slot.startTime);
								const endMinutes = convertTimeToMinutes(slot.endTime);
								const sessionLength = Number(slot.sessionLengthMinutes || 60);
								const nextDate = getNextDateForDay(slot.day, slot.startTime);
								const readableDate = nextDate.toLocaleDateString(undefined, {
									weekday: "short",
									month: "short",
									day: "numeric",
								});
								const slots = [];

								for (
									let current = startMinutes;
									current + sessionLength <= endMinutes;
									current += sessionLength
								) {
									const sessionStart = convertMinutesToTime(current);
									const sessionEnd = convertMinutesToTime(
										current + sessionLength,
									);
									const label = `${slot.day} - ${sessionStart} to ${sessionEnd}`;

									if (!profileBookedLabels.has(label)) {
										slots.push({
											label,
											readableDate,
											startTime: sessionStart,
											endTime: sessionEnd,
										});
									}
								}

								return slots;
							},
						);

						return (
							<div
								key={profile._id}
								className='dashboard-panel'
								style={{ marginBottom: "16px" }}>
								<p>
									<strong>Course:</strong> {profile.course}
								</p>
								<p>
									<strong>Bio:</strong> {profile.bio}
								</p>
								<div className='slot-section'>
									<strong>Availability Windows</strong>
									{profile.availability.length === 0 ? (
										<p className='muted-text'>
											No active slots. Update your availability.
										</p>
									) : (
										<ul className='slot-list'>
											{profile.availability.map((slot, index) => (
												<li key={`${profile._id}-${index}`}>
													{formatAvailabilitySlot(slot)} •{" "}
													{getWindowSlotCount(slot)} bookable session
													{getWindowSlotCount(slot) === 1 ? "" : "s"}
												</li>
											))}
										</ul>
									)}
								</div>

								<div className='slot-section'>
									<strong>Next 5 Open Session Slots</strong>
									{profileOpenSlots.length === 0 ? (
										<p className='muted-text'>
											All currently generated slots are booked.
										</p>
									) : (
										<ul className='slot-list'>
											{profileOpenSlots.slice(0, 5).map((slot) => (
												<li key={slot.label}>
													{slot.readableDate}: {slot.startTime} - {slot.endTime}
												</li>
											))}
										</ul>
									)}
								</div>

								<button
									type='button'
									className='secondary-btn'
									onClick={() => {
										setSelectedProfileId(profile._id);
										setAvailability(profile.availability || []);
										resetSlotForm();
										setIsAvailabilityModalOpen(true);
									}}>
									Update Availability for {profile.course}
								</button>
							</div>
						);
					})
				) : (
					<div className='empty-inline-state'>
						<p>
							You are not approved yet. Submit your tutor application first.
						</p>
						<button
							className='primary-btn'
							onClick={() => navigate("/student/tutor-apply")}>
							Go to Tutor Application
						</button>
					</div>
				)}
			</section>

			<section className='dashboard-panel enhanced-panel'>
				<h2>My Next 5 Bookings</h2>
				{isSessionsLoading ? (
					<Loader />
				) : upcomingSessions.length === 0 ? (
					<EmptyState
						title='No student bookings yet'
						text='Booked sessions from students will appear here once they start scheduling with you.'
					/>
				) : (
					upcomingSessions.map((session) => (
						<SessionCard
							key={session._id}
							course={session.course}
							tutor={`Student: ${session.student?.name || "Unknown"}`}
							time={formatSessionTime(session)}
							status={session.status || "pending"}
						/>
					))
				)}
			</section>

			<Modal
				isOpen={isAvailabilityModalOpen}
				onClose={handleCloseAvailabilityModal}
				title='Update Availability'
				size='lg'>
				<div className='booking-form'>
					<div>
						<label>Availability Slots</label>
						<p className='muted-text'>
							Edit your availability windows and session lengths below.
						</p>
					</div>

					{myTutorProfiles.length > 1 ? (
						<>
							<label>Course</label>
							<select
								value={selectedProfileId}
								onChange={handleProfileSelection}>
								{myTutorProfiles.map((profile) => (
									<option
										key={profile._id}
										value={profile._id}>
										{profile.course}
									</option>
								))}
							</select>
						</>
					) : null}

					<label>Day Available</label>
					<select
						name='day'
						value={slotForm.day}
						onChange={handleSlotChange}>
						<option value=''>Select day</option>
						{DAYS.map((day) => (
							<option
								key={day}
								value={day}>
								{day}
							</option>
						))}
					</select>

					<label>Start Time</label>
					<div className='action-grid'>
						<select
							name='hour'
							value={slotForm.hour}
							onChange={handleSlotChange}>
							<option value=''>Hour</option>
							{HOURS.map((hour) => (
								<option
									key={hour}
									value={hour}>
									{hour}
								</option>
							))}
						</select>
						<select
							name='minute'
							value={slotForm.minute}
							onChange={handleSlotChange}>
							{MINUTES.map((minute) => (
								<option
									key={minute}
									value={minute}>
									{minute}
								</option>
							))}
						</select>
						<select
							name='period'
							value={slotForm.period}
							onChange={handleSlotChange}>
							{PERIODS.map((period) => (
								<option
									key={period}
									value={period}>
									{period}
								</option>
							))}
						</select>
					</div>

					<label>End Time</label>
					<div className='action-grid'>
						<select
							name='endHour'
							value={slotForm.endHour}
							onChange={handleSlotChange}>
							<option value=''>Hour</option>
							{HOURS.map((hour) => (
								<option
									key={hour}
									value={hour}>
									{hour}
								</option>
							))}
						</select>
						<select
							name='endMinute'
							value={slotForm.endMinute}
							onChange={handleSlotChange}>
							{MINUTES.map((minute) => (
								<option
									key={minute}
									value={minute}>
									{minute}
								</option>
							))}
						</select>
						<select
							name='endPeriod'
							value={slotForm.endPeriod}
							onChange={handleSlotChange}>
							{PERIODS.map((period) => (
								<option
									key={period}
									value={period}>
									{period}
								</option>
							))}
						</select>
					</div>

					<label>Session Length</label>
					<select
						name='sessionLengthMinutes'
						value={slotForm.sessionLengthMinutes}
						onChange={handleSlotChange}>
						<option value='30'>30 minutes</option>
						<option value='45'>45 minutes</option>
						<option value='60'>60 minutes</option>
						<option value='90'>90 minutes</option>
						<option value='120'>120 minutes</option>
					</select>

					<div className='booking-form-actions'>
						<button
							type='button'
							className='primary-btn'
							onClick={handleAddAvailability}>
							{editingIndex !== null ? "Save Slot" : "Add Availability Slot"}
						</button>
						{editingIndex !== null ? (
							<button
								type='button'
								className='secondary-btn'
								onClick={resetSlotForm}>
								Cancel Edit
							</button>
						) : null}
					</div>

					{availability.length === 0 ? (
						<p className='muted-text'>No availability added yet.</p>
					) : (
						<div style={{ marginBottom: "16px" }}>
							{availability.map((slot, index) => (
								<div
									key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "8px",
										padding: "10px 12px",
										border: "1px solid #ddd",
										borderRadius: "8px",
										gap: "12px",
										flexWrap: "wrap",
									}}>
									<span>{formatAvailabilitySlot(slot)}</span>

									<div style={{ display: "flex", gap: "8px" }}>
										<button
											type='button'
											onClick={() => handleEditAvailability(index)}
											style={{
												backgroundColor: "#2563eb",
												color: "#fff",
												border: "none",
												padding: "8px 12px",
												borderRadius: "6px",
												cursor: "pointer",
											}}>
											Edit
										</button>

										<button
											type='button'
											onClick={() => handleRemoveAvailability(index)}
											style={{
												backgroundColor: "#dc2626",
												color: "#fff",
												border: "none",
												padding: "8px 12px",
												borderRadius: "6px",
												cursor: "pointer",
											}}>
											Remove
										</button>
									</div>
								</div>
							))}
						</div>
					)}

					<div className='booking-form-actions'>
						<button
							type='button'
							className='secondary-btn'
							onClick={handleCloseAvailabilityModal}>
							Cancel
						</button>
						<button
							type='button'
							className='primary-btn'
							onClick={handleSaveAvailability}
							disabled={isUpdatingAvailability}>
							{isUpdatingAvailability ? "Saving..." : "Save Availability"}
						</button>
					</div>
				</div>
			</Modal>
		</Layout>
	);
}

export default TutorDashboard;
