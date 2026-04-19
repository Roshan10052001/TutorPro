import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";
import { useGetTutors } from "../hooks/tutor";
import { useCreateBooking } from "../hooks/booking";
import { errorAlert, warnAlert } from "../utils";

const convertTimeToMinutes = (timeString) => {
	const [time, modifier] = timeString.split(" ");
	let [hours, minutes] = time.split(":").map(Number);

	if (modifier === "PM" && hours !== 12) hours += 12;
	if (modifier === "AM" && hours === 12) hours = 0;

	return hours * 60 + minutes;
};

const convertMinutesToTime = (totalMinutes) => {
	let hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	const modifier = hours >= 12 ? "PM" : "AM";

	hours = hours % 12;
	if (hours === 0) hours = 12;

	return `${hours}:${String(minutes).padStart(2, "0")} ${modifier}`;
};

const getNextDateForDay = (dayName) => {
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	const today = new Date();
	const todayDay = today.getDay();
	const targetDay = days.indexOf(dayName);
	let diff = targetDay - todayDay;

	if (diff <= 0) diff += 7;

	const result = new Date(today);
	result.setDate(today.getDate() + diff);
	result.setHours(0, 0, 0, 0);
	return result;
};

function BookSession() {
	const { data: tutors = [] } = useGetTutors();
	const approvedTutors = tutors?.filter((tutor) => tutor.status === "approved");
	const { mutateAsync: bookSession, isPending } = useCreateBooking();
	// const { user } = useContext(AuthContext);

	const [formData, setFormData] = useState({
		tutor: "",
		course: "",
		slot: "",
		note: "",
	});

	const availableTutors = useMemo(
		() => approvedTutors.filter((tutor) => tutor.availability.length > 0),
		[approvedTutors],
	);

	const selectedTutor = useMemo(
		() => availableTutors.find((tutor) => tutor._id === formData.tutor),
		[availableTutors, formData.tutor],
	);

	const availableSlots = useMemo(() => {
		if (!selectedTutor) return [];

		return selectedTutor.availability.flatMap((slot) => {
			const startMinutes = convertTimeToMinutes(slot.startTime);
			const endMinutes = convertTimeToMinutes(slot.endTime);
			const sessionLength = Number(slot.sessionLengthMinutes || 60);
			const slots = [];

			for (
				let current = startMinutes;
				current + sessionLength <= endMinutes;
				current += sessionLength
			) {
				const sessionStart = convertMinutesToTime(current);
				const sessionEnd = convertMinutesToTime(current + sessionLength);
				slots.push({
					label: `${slot.day} - ${sessionStart} to ${sessionEnd}`,
					day: slot.day,
					startTime: sessionStart,
					endTime: sessionEnd,
				});
			}

			return slots;
		});
	}, [selectedTutor]);

	const groupedSlots = useMemo(() => {
		return availableSlots.reduce((groups, slot) => {
			if (!groups[slot.day]) {
				groups[slot.day] = [];
			}

			groups[slot.day].push(slot);
			return groups;
		}, {});
	}, [availableSlots]);

	useEffect(() => {
		if (selectedTutor) {
			setFormData((prev) => ({
				...prev,
				course: selectedTutor.course,
				slot: "",
			}));
		}
	}, [selectedTutor]);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.tutor || !formData.slot) {
			warnAlert("Please select tutor and time slot.");
			return;
		}

		const selectedSlot = availableSlots.find(
			(slot) => slot.label === formData.slot,
		);

		if (!selectedSlot) {
			warnAlert("Please choose a valid available slot.");
			return;
		}

		const sessionDate = getNextDateForDay(selectedSlot.day);

		try {
			await bookSession({
				tutor: formData.tutor,
				course: formData.course,
				date: sessionDate.toISOString(),
				startTime: selectedSlot.startTime,
				endTime: selectedSlot.endTime,
				notes: formData.note,
			});

			setFormData({
				tutor: "",
				course: "",
				slot: "",
				note: "",
			});
		} catch (error) {
			errorAlert(error);
		}
	};

	return (
		<div className='dashboard-layout'>
			<Sidebar role='Student' />

			<main className='dashboard-main'>
				<div className='dashboard-header'>
					<div>
						<h1>Book a Session</h1>
						<p>Select an approved tutor and book one open time slot.</p>
					</div>
				</div>

				{availableTutors.length === 0 ? (
					<EmptyState
						title='No bookable tutors yet'
						text='There are no approved tutors with open slots right now.'
					/>
				) : (
					<section className='dashboard-panel form-panel enhanced-panel'>
						<form
							className='booking-form'
							onSubmit={handleSubmit}>
							<label>Select Tutor</label>
							<select
								name='tutor'
								value={formData.tutor}
								onChange={handleChange}
								required>
								<option value=''>Choose tutor</option>
								{availableTutors?.map((tutor) => (
									<option
										key={tutor._id}
										value={tutor._id}>
										{tutor.name} - {tutor.course}
									</option>
								))}
							</select>

							<label>Course</label>
							<input
								type='text'
								value={formData.course}
								readOnly
							/>

							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "12px",
								}}>
								<label>Available Time Slots</label>

								{!selectedTutor ? (
									<p style={{ color: "#64748b" }}>
										Select a tutor first to view available time slots.
									</p>
								) : availableSlots.length === 0 ? (
									<p style={{ color: "#64748b" }}>
										No available slots for this tutor.
									</p>
								) : (
									Object.entries(groupedSlots).map(([day, daySlots]) => (
										<div
											key={day}
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "10px",
											}}>
											<h3
												style={{
													fontSize: "1rem",
													fontWeight: 700,
													color: "#0f172a",
												}}>
												{day}
											</h3>

											<div
												style={{
													display: "grid",
													gridTemplateColumns:
														"repeat(auto-fill, minmax(180px, 1fr))",
													gap: "12px",
												}}>
												{daySlots.map((slot) => {
													const isSelected = formData.slot === slot.label;

													return (
														<button
															key={slot.label}
															type='button'
															onClick={() =>
																setFormData((prev) => ({
																	...prev,
																	slot: slot.label,
																}))
															}
															style={{
																padding: "14px 16px",
																borderRadius: "14px",
																border: isSelected
																	? "2px solid #1d4ed8"
																	: "1px solid rgba(148, 163, 184, 0.3)",
																background: isSelected
																	? "rgba(37, 99, 235, 0.12)"
																	: "rgba(255, 255, 255, 0.95)",
																color: "#0f172a",
																boxShadow: isSelected
																	? "0 10px 24px rgba(37, 99, 235, 0.16)"
																	: "0 6px 16px rgba(15, 23, 42, 0.05)",
																textAlign: "left",
																justifyContent: "flex-start",
																minHeight: "72px",
															}}>
															<span
																style={{
																	fontWeight: 700,
																	lineHeight: 1.45,
																}}>
																{slot.startTime} - {slot.endTime}
															</span>
														</button>
													);
												})}
											</div>
										</div>
									))
								)}

								{formData.slot && (
									<p
										style={{
											padding: "10px 12px",
											borderRadius: "12px",
											background: "rgba(37, 99, 235, 0.08)",
											color: "#1d4ed8",
											fontWeight: 600,
										}}>
										Selected Slot: {formData.slot}
									</p>
								)}
							</div>

							<label>Note</label>
							<textarea
								name='note'
								value={formData.note}
								onChange={handleChange}
								placeholder='Write a short note for the tutor'
								rows='4'
							/>

							<button
								type='submit'
								className='primary-btn'
								disabled={isPending}>
								{isPending ? "Booking..." : "Confirm Booking"}
							</button>
						</form>
					</section>
				)}
			</main>
		</div>
	);
}

export default BookSession;
