import { useState, useContext } from "react";
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
import { AuthContext } from "../context";
import {
	convertMinutesToTime,
	convertTimeToMinutes,
	getNextDateForDay,
} from "../utils/functions";
import { DAYS, HOURS, MINUTES, PERIODS, warnAlert } from "../utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const selectClass =
	"flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

function TutorDashboard() {
	const navigate = useNavigate();
	const { data: tutors = [] } = useGetTutors();
	const { data: sessions = [], isPending: isSessionsLoading } = useGetBookings({
		view: "tutor",
	});
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
			tutor.email.trim().toLowerCase() === user?.email.trim().toLowerCase()
	);
	const myTutorProfile =
		myTutorProfiles.find((profile) => profile._id === selectedProfileId) ||
		myTutorProfiles[0] ||
		null;

	const mySessions = sessions.filter(
		(session) => session.tutor?._id?.toString() === user?.id?.toString()
	);

	const getSessionDateTime = (session) => {
		if (!session?.date) return null;
		const sessionDate = new Date(session.date);
		const startMinutes = convertTimeToMinutes(session.startTime || "12:00 AM");
		sessionDate.setHours(
			Math.floor(startMinutes / 60),
			startMinutes % 60,
			0,
			0
		);
		return sessionDate;
	};

	const totalOpenAvailabilitySlots = myTutorProfiles.reduce((count, profile) => {
		const labels = new Set(
			(profile.bookedSlots || []).map((slot) => slot.label)
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
					if (!labels.has(label)) generatedCount += 1;
				}
				return slotCount + generatedCount;
			},
			0
		);
		return count + profileOpenSlots;
	}, 0);

	const upcomingSessions = [...mySessions]
		.sort((a, b) => getSessionDateTime(a) - getSessionDateTime(b))
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
			(profile) => profile._id === nextProfileId
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
			warnAlert("Session length cannot be longer than the selected time range.");
			return;
		}

		const duplicateExists = availability.some(
			(existingSlot, index) =>
				existingSlot.day === slot.day &&
				existingSlot.startTime === slot.startTime &&
				existingSlot.endTime === slot.endTime &&
				existingSlot.sessionLengthMinutes === slot.sessionLengthMinutes &&
				index !== editingIndex
		);

		if (duplicateExists) {
			warnAlert("That availability slot has already been added.");
			return;
		}

		if (editingIndex !== null) {
			setAvailability((prev) =>
				prev.map((item, index) => (index === editingIndex ? slot : item))
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
			prev.filter((_, index) => index !== indexToRemove)
		);
		if (editingIndex === indexToRemove) resetSlotForm();
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
			page="Tutor"
			title="Tutor Dashboard"
			subtitle="Manage your tutor profile, availability, and student bookings."
			headerAction={
				<div className="flex flex-wrap gap-3">
					<Button
						variant="outline"
						onClick={() =>
							navigate("/tutor/tutor-apply", {
								state: { openNewApplication: true },
							})
						}>
						Apply for Another Course
					</Button>
					<Button onClick={handleOpenAvailabilityModal}>
						{myTutorProfile ? "Update Availability" : "Apply as Tutor"}
					</Button>
				</div>
			}>
			<section className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				<StatCard
					title="Approval Status"
					value={
						myTutorProfiles.length > 0 ? "Approved" : "Pending / Not Approved"
					}
					subtitle="Admin controlled"
				/>
				<StatCard
					title="My Sessions"
					value={mySessions.length}
					subtitle="Booked by students"
				/>
				<StatCard
					title="Open Session Slots"
					value={totalOpenAvailabilitySlots}
					subtitle="Currently bookable"
				/>
			</section>

			<Card className="mb-6">
				<CardContent className="p-6">
					<h2 className="mb-4 text-lg font-bold text-slate-900">
						My Tutor Status
					</h2>
					{myTutorProfiles.length > 0 ? (
						myTutorProfiles.map((profile) => {
							const profileBookedLabels = new Set(
								(profile.bookedSlots || []).map((slot) => slot.label)
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
											current + sessionLength
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
								}
							);

							return (
								<div
									key={profile._id}
									className="mb-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 last:mb-0">
									<p className="mb-1 text-sm text-slate-700">
										<strong className="text-slate-900">Course:</strong>{" "}
										{profile.course}
									</p>
									<p className="mb-3 text-sm text-slate-700">
										<strong className="text-slate-900">Bio:</strong> {profile.bio}
									</p>

									<div className="mt-3">
										<strong className="text-sm font-semibold text-slate-900">
											Availability Windows
										</strong>
										{profile.availability.length === 0 ? (
											<p className="mt-1 text-sm text-slate-500">
												No active slots. Update your availability.
											</p>
										) : (
											<ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-600">
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

									<div className="mt-3">
										<strong className="text-sm font-semibold text-slate-900">
											Next 5 Open Session Slots
										</strong>
										{profileOpenSlots.length === 0 ? (
											<p className="mt-1 text-sm text-slate-500">
												All currently generated slots are booked.
											</p>
										) : (
											<ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-600">
												{profileOpenSlots.slice(0, 5).map((slot) => (
													<li key={slot.label}>
														{slot.readableDate}: {slot.startTime} -{" "}
														{slot.endTime}
													</li>
												))}
											</ul>
										)}
									</div>

									<Button
										variant="outline"
										className="mt-4"
										onClick={() => {
											setSelectedProfileId(profile._id);
											setAvailability(profile.availability || []);
											resetSlotForm();
											setIsAvailabilityModalOpen(true);
										}}>
										Update Availability for {profile.course}
									</Button>
								</div>
							);
						})
					) : (
						<div className="flex flex-col items-start gap-3">
							<p className="text-sm text-slate-600">
								You are not approved yet. Submit your tutor application first.
							</p>
							<Button onClick={() => navigate("/student/tutor-apply")}>
								Go to Tutor Application
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="mb-6">
				<CardContent className="p-6">
					<h2 className="mb-4 text-lg font-bold text-slate-900">
						My Next 5 Bookings
					</h2>
					{isSessionsLoading ? (
						<Loader />
					) : upcomingSessions.length === 0 ? (
						<EmptyState
							title="No student bookings yet"
							text="Booked sessions from students will appear here once they start scheduling with you."
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
				</CardContent>
			</Card>

			<Modal
				isOpen={isAvailabilityModalOpen}
				onClose={handleCloseAvailabilityModal}
				title="Update Availability"
				size="lg">
				<div className="flex flex-col gap-4">
					<div>
						<Label>Availability Slots</Label>
						<p className="mt-1 text-sm text-slate-500">
							Edit your availability windows and session lengths below.
						</p>
					</div>

					{myTutorProfiles.length > 1 ? (
						<div className="flex flex-col gap-1.5">
							<Label>Course</Label>
							<select
								value={selectedProfileId}
								onChange={handleProfileSelection}
								className={selectClass}>
								{myTutorProfiles.map((profile) => (
									<option key={profile._id} value={profile._id}>
										{profile.course}
									</option>
								))}
							</select>
						</div>
					) : null}

					<div className="flex flex-col gap-1.5">
						<Label>Day Available</Label>
						<select
							name="day"
							value={slotForm.day}
							onChange={handleSlotChange}
							className={selectClass}>
							<option value="">Select day</option>
							{DAYS.map((day) => (
								<option key={day} value={day}>
									{day}
								</option>
							))}
						</select>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label>Start Time</Label>
						<div className="grid grid-cols-3 gap-2">
							<select
								name="hour"
								value={slotForm.hour}
								onChange={handleSlotChange}
								className={selectClass}>
								<option value="">Hour</option>
								{HOURS.map((h) => (
									<option key={h} value={h}>
										{h}
									</option>
								))}
							</select>
							<select
								name="minute"
								value={slotForm.minute}
								onChange={handleSlotChange}
								className={selectClass}>
								{MINUTES.map((m) => (
									<option key={m} value={m}>
										{m}
									</option>
								))}
							</select>
							<select
								name="period"
								value={slotForm.period}
								onChange={handleSlotChange}
								className={selectClass}>
								{PERIODS.map((p) => (
									<option key={p} value={p}>
										{p}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label>End Time</Label>
						<div className="grid grid-cols-3 gap-2">
							<select
								name="endHour"
								value={slotForm.endHour}
								onChange={handleSlotChange}
								className={selectClass}>
								<option value="">Hour</option>
								{HOURS.map((h) => (
									<option key={h} value={h}>
										{h}
									</option>
								))}
							</select>
							<select
								name="endMinute"
								value={slotForm.endMinute}
								onChange={handleSlotChange}
								className={selectClass}>
								{MINUTES.map((m) => (
									<option key={m} value={m}>
										{m}
									</option>
								))}
							</select>
							<select
								name="endPeriod"
								value={slotForm.endPeriod}
								onChange={handleSlotChange}
								className={selectClass}>
								{PERIODS.map((p) => (
									<option key={p} value={p}>
										{p}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label>Session Length</Label>
						<select
							name="sessionLengthMinutes"
							value={slotForm.sessionLengthMinutes}
							onChange={handleSlotChange}
							className={selectClass}>
							<option value="30">30 minutes</option>
							<option value="45">45 minutes</option>
							<option value="60">60 minutes</option>
							<option value="90">90 minutes</option>
							<option value="120">120 minutes</option>
						</select>
					</div>

					<div className="flex flex-wrap gap-2">
						<Button onClick={handleAddAvailability}>
							{editingIndex !== null ? "Save Slot" : "Add Availability Slot"}
						</Button>
						{editingIndex !== null ? (
							<Button variant="outline" onClick={resetSlotForm}>
								Cancel Edit
							</Button>
						) : null}
					</div>

					{availability.length === 0 ? (
						<p className="text-sm text-slate-500">No availability added yet.</p>
					) : (
						<div className="flex flex-col gap-2">
							{availability.map((slot, index) => (
								<div
									key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}
									className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
									<span className="text-sm text-slate-700">
										{formatAvailabilitySlot(slot)}
									</span>
									<div className="flex gap-2">
										<Button
											size="sm"
											onClick={() => handleEditAvailability(index)}>
											Edit
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => handleRemoveAvailability(index)}>
											Remove
										</Button>
									</div>
								</div>
							))}
						</div>
					)}

					<div className="flex flex-wrap justify-end gap-2 pt-2">
						<Button variant="outline" onClick={handleCloseAvailabilityModal}>
							Cancel
						</Button>
						<Button
							onClick={handleSaveAvailability}
							disabled={isUpdatingAvailability}>
							{isUpdatingAvailability ? "Saving..." : "Save Availability"}
						</Button>
					</div>
				</div>
			</Modal>
		</Layout>
	);
}

export default TutorDashboard;
