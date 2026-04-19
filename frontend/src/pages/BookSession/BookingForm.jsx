import { useContext, useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import { useGetTutors } from "../../hooks/tutor";
import { useCreateBooking } from "../../hooks/booking";
import {
	convertMinutesToTime,
	convertTimeToMinutes,
	getNextDateForDay,
} from "../../utils/functions";
import Swal from "sweetalert2";
import "./styles.css";
import { AuthContext } from "../../context";
import { errorAlert, warnAlert } from "../../utils";

function BookingForm({ onSuccess, onCancel, initialTutorId = "" }) {
	const { user } = useContext(AuthContext);
	const { data: tutors = [] } = useGetTutors();
	const approvedTutors = tutors.filter((tutor) => tutor.status === "approved");
	const { mutateAsync: bookSession, isPending } = useCreateBooking();

	const [formData, setFormData] = useState({
		tutor: "",
		course: "",
		slot: "",
		note: "",
	});

	const [isSelfBooking, setIsSelfBooking] = useState(false);

	const availableTutors = useMemo(
		() => approvedTutors.filter((tutor) => tutor.availability.length > 0),
		[approvedTutors],
	);

	const selectedTutor = useMemo(
		() => availableTutors.find((tutor) => tutor._id === formData.tutor),
		[availableTutors, formData.tutor],
	);

	useEffect(() => {
		if (!initialTutorId) return;

		const hasMatchingTutor = availableTutors.some(
			(tutor) => tutor._id === initialTutorId,
		);

		if (!hasMatchingTutor) return;

		setFormData((prev) => ({
			...prev,
			tutor: initialTutorId,
		}));
	}, [availableTutors, initialTutorId]);

	const availableSlots = useMemo(() => {
		if (!selectedTutor) return [];

		const bookedSlotLabels = new Set(
			(selectedTutor.bookedSlots || []).map((slot) => slot.label),
		);

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
					isBooked: bookedSlotLabels.has(
						`${slot.day} - ${sessionStart} to ${sessionEnd}`,
					),
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
		if (!selectedTutor) return;

		setFormData((prev) => ({
			...prev,
			course: selectedTutor.course,
			slot: "",
		}));
	}, [selectedTutor]);

	useEffect(() => {
		if (!formData.slot) return;
		const selectedSlot = availableSlots.find(
			(slot) => slot.label === formData.slot,
		);
		if (selectedSlot?.isBooked) {
			setFormData((prev) => ({
				...prev,
				slot: "",
			}));
		}
	}, [availableSlots, formData.slot]);

	useEffect(() => {
		if (!selectedTutor || !user?.id) {
			setIsSelfBooking(false);
			return;
		}

		const isCurrentUserSelected =
			selectedTutor.userId?.toString() === user.id?.toString();

		setIsSelfBooking(isCurrentUserSelected);

		if (isCurrentUserSelected) {
			setFormData((prev) => ({
				...prev,
				slot: "",
			}));

			// replace this with your real warning util
			// warningAlert("You cannot book yourself as your own tutor.");
			warnAlert("You cannot book yourself as your own tutor.");
		}
	}, [selectedTutor, user?.id]);

	const handleChange = (event) => {
		setFormData((prev) => ({
			...prev,
			[event.target.name]: event.target.value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (isSelfBooking) {
			warnAlert("You cannot book yourself as your own tutor.");
			return;
		}
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

		const sessionDate = getNextDateForDay(
			selectedSlot.day,
			selectedSlot.startTime,
		);

		const result = await Swal.fire({
			title: "Confirmation",
			text: "Are you sure you want to book this session?",
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "Cancel",
			reverseButtons: true,
		});

		if (!result.isConfirmed) return;

		try {
			await bookSession({
				tutor: selectedTutor.userId,
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

			onSuccess?.();
		} catch (error) {
			errorAlert(error);
		}
	};

	if (availableTutors.length === 0) {
		return (
			<EmptyState
				title='No bookable tutors yet'
				text='There are no approved tutors with open slots right now.'
			/>
		);
	}

	return (
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
				{availableTutors.map((tutor) => (
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

			<div className='slot-picker'>
				<label>Available Time Slots</label>

				{!selectedTutor ? (
					<p className='slot-picker-message'>
						Select a tutor first to view available time slots.
					</p>
				) : availableSlots.length === 0 ? (
					<p className='slot-picker-message'>
						No available slots for this tutor.
					</p>
				) : (
					Object.entries(groupedSlots).map(([day, daySlots]) => (
						<div
							key={day}
							className='slot-day-group'>
							<h3 className='slot-day-heading'>{day}</h3>

							<div className='slot-grid'>
								{daySlots.map((slot) => {
									const isSelected = formData.slot === slot.label;

									return (
										<button
											key={slot.label}
											type='button'
											className={`slot-card${isSelected ? " selected" : ""}${slot.isBooked ? " unavailable" : ""}`}
											onClick={() =>
												setFormData((prev) => ({
													...prev,
													slot: slot.label,
												}))
											}
											disabled={slot.isBooked}
											aria-pressed={isSelected}>
											<span className='slot-card-time'>
												{slot.startTime} - {slot.endTime}
											</span>
											{slot.isBooked ? (
												<span className='slot-card-meta'>Booked</span>
											) : null}
										</button>
									);
								})}
							</div>
						</div>
					))
				)}

				{formData.slot ? (
					<p className='slot-selected-preview'>
						Selected Slot: {formData.slot}
					</p>
				) : null}
			</div>

			<label>Note</label>
			<textarea
				name='note'
				value={formData.note}
				onChange={handleChange}
				placeholder='Write a short note for the tutor'
				rows='4'
			/>

			<div className='booking-form-actions'>
				{onCancel ? (
					<button
						type='button'
						className='secondary-btn'
						onClick={onCancel}>
						Cancel
					</button>
				) : null}
				<button
					type='submit'
					className='primary-btn'
					disabled={isPending}>
					{isPending ? "Booking..." : "Confirm Booking"}
				</button>
			</div>
		</form>
	);
}

export default BookingForm;
