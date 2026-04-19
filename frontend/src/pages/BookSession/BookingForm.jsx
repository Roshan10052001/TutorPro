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
import { AuthContext } from "../../context";
import { errorAlert, warnAlert } from "../../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const selectClass =
	"flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const textareaClass =
	"flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

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
		[approvedTutors]
	);

	const selectedTutor = useMemo(
		() => availableTutors.find((tutor) => tutor._id === formData.tutor),
		[availableTutors, formData.tutor]
	);

	useEffect(() => {
		if (!initialTutorId) return;
		const hasMatchingTutor = availableTutors.some(
			(tutor) => tutor._id === initialTutorId
		);
		if (!hasMatchingTutor) return;
		setFormData((prev) => ({ ...prev, tutor: initialTutorId }));
	}, [availableTutors, initialTutorId]);

	const availableSlots = useMemo(() => {
		if (!selectedTutor) return [];
		const bookedSlotLabels = new Set(
			(selectedTutor.bookedSlots || []).map((slot) => slot.label)
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
						`${slot.day} - ${sessionStart} to ${sessionEnd}`
					),
				});
			}
			return slots;
		});
	}, [selectedTutor]);

	const groupedSlots = useMemo(() => {
		return availableSlots.reduce((groups, slot) => {
			if (!groups[slot.day]) groups[slot.day] = [];
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
			(slot) => slot.label === formData.slot
		);
		if (selectedSlot?.isBooked) {
			setFormData((prev) => ({ ...prev, slot: "" }));
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
			setFormData((prev) => ({ ...prev, slot: "" }));
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
			(slot) => slot.label === formData.slot
		);
		if (!selectedSlot) {
			warnAlert("Please choose a valid available slot.");
			return;
		}

		const sessionDate = getNextDateForDay(
			selectedSlot.day,
			selectedSlot.startTime
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
			setFormData({ tutor: "", course: "", slot: "", note: "" });
			onSuccess?.();
		} catch (error) {
			errorAlert(error);
		}
	};

	if (availableTutors.length === 0) {
		return (
			<EmptyState
				title="No bookable tutors yet"
				text="There are no approved tutors with open slots right now."
			/>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-1.5">
				<Label>Select Tutor</Label>
				<select
					name="tutor"
					value={formData.tutor}
					onChange={handleChange}
					required
					className={selectClass}>
					<option value="">Choose tutor</option>
					{availableTutors.map((tutor) => (
						<option key={tutor._id} value={tutor._id}>
							{tutor.name} - {tutor.course}
						</option>
					))}
				</select>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label>Course</Label>
				<Input type="text" value={formData.course} readOnly />
			</div>

			<div className="flex flex-col gap-3">
				<Label>Available Time Slots</Label>

				{!selectedTutor ? (
					<p className="text-sm text-slate-500">
						Select a tutor first to view available time slots.
					</p>
				) : availableSlots.length === 0 ? (
					<p className="text-sm text-slate-500">
						No available slots for this tutor.
					</p>
				) : (
					Object.entries(groupedSlots).map(([day, daySlots]) => (
						<div key={day} className="flex flex-col gap-2.5">
							<h3 className="text-base font-bold text-slate-900">{day}</h3>
							<div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
								{daySlots.map((slot) => {
									const isSelected = formData.slot === slot.label;
									return (
										<button
											key={slot.label}
											type="button"
											onClick={() =>
												setFormData((prev) => ({
													...prev,
													slot: slot.label,
												}))
											}
											disabled={slot.isBooked}
											aria-pressed={isSelected}
											className={cn(
												"flex min-h-[72px] flex-col items-start justify-center rounded-xl border p-4 text-left transition",
												isSelected
													? "border-2 border-blue-700 bg-blue-500/10 shadow-lg shadow-blue-500/15"
													: "border-slate-200 bg-white shadow-sm hover:border-blue-300",
												slot.isBooked && "cursor-not-allowed opacity-50"
											)}>
											<span className="font-bold leading-snug text-slate-900">
												{slot.startTime} - {slot.endTime}
											</span>
											{slot.isBooked ? (
												<span className="mt-1 text-xs text-slate-500">
													Booked
												</span>
											) : null}
										</button>
									);
								})}
							</div>
						</div>
					))
				)}

				{formData.slot ? (
					<p className="rounded-xl bg-blue-500/10 px-3 py-2.5 font-semibold text-blue-700">
						Selected Slot: {formData.slot}
					</p>
				) : null}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label>Note</Label>
				<textarea
					name="note"
					value={formData.note}
					onChange={handleChange}
					placeholder="Write a short note for the tutor"
					rows="4"
					className={textareaClass}
				/>
			</div>

			<div className="flex flex-wrap justify-end gap-2 pt-2">
				{onCancel ? (
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				) : null}
				<Button type="submit" disabled={isPending}>
					{isPending ? "Booking..." : "Confirm Booking"}
				</Button>
			</div>
		</form>
	);
}

export default BookingForm;
