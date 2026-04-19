import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { DAYS, HOURS, MINUTES, PERIODS, warnAlert } from "../utils";
import { useContext } from "react";
import { AuthContext } from "../context";
import {
	useGetTutorApplications,
	useSubmitTutorApplication,
} from "../hooks/tutorApplication";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_VARIANTS = {
	pending: "bg-amber-100 text-amber-800",
	approved: "bg-emerald-100 text-emerald-800",
	rejected: "bg-rose-100 text-rose-800",
};

const selectClass =
	"flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

function TutorApply() {
	const { user } = useContext(AuthContext);
	const location = useLocation();
	const navigate = useNavigate();
	const {
		data: tutorApplications = [],
		isPending: isApplicationsLoading,
	} = useGetTutorApplications();
	const { mutateAsync, isPending, reset } = useSubmitTutorApplication();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const initialFormData = useMemo(
		() => ({
			name: user?.name || "",
			email: user?.email || "",
			course: "",
			bio: "",
		}),
		[user?.name, user?.email],
	);

	const [formData, setFormData] = useState(initialFormData);
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
	const [availability, setAvailability] = useState([]);
	const [editingIndex, setEditingIndex] = useState(null);

	const sidebarRole = user?.role === "tutor" ? "Tutor" : "Student";

	const handleChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSlotChange = (e) => {
		setSlotForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const buildSlotLabel = () => ({
		day: slotForm.day,
		startTime: `${slotForm.hour}:${slotForm.minute} ${slotForm.period}`,
		endTime: `${slotForm.endHour}:${slotForm.endMinute} ${slotForm.endPeriod}`,
		sessionLengthMinutes: Number(slotForm.sessionLengthMinutes),
	});

	const convertToMinutes = (timeString) => {
		const [time, modifier] = timeString.split(" ");
		let [hours, minutes] = time.split(":").map(Number);
		if (modifier === "PM" && hours !== 12) hours += 12;
		if (modifier === "AM" && hours === 12) hours = 0;
		return hours * 60 + minutes;
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

		const slot = buildSlotLabel();
		const startMinutes = convertToMinutes(slot.startTime);
		const endMinutes = convertToMinutes(slot.endTime);

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
		setAvailability((prev) => prev.filter((_, index) => index !== indexToRemove));
		if (editingIndex === indexToRemove) {
			resetSlotForm();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (availability.length === 0) {
			warnAlert("Please add at least one availability slot.");
			return;
		}

		const result = await Swal.fire({
			title: "Confirmation",
			text: "Are you sure you want to submit this application?",
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "Cancel",
			reverseButtons: true,
		});

		if (!result.isConfirmed) return;

		try {
			await mutateAsync({
				name: formData.name.trim(),
				email: formData.email.trim(),
				course: formData.course.trim(),
				availability,
				bio: formData.bio.trim(),
			});
			setFormData({
				name: user?.name || "",
				email: user?.email || "",
				course: "",
				bio: "",
			});
			setAvailability([]);
			resetSlotForm();
			reset();
			setIsModalOpen(false);
		} catch {
			reset();
		}
	};

	const isSlotIncomplete =
		!slotForm.day ||
		!slotForm.hour ||
		!slotForm.minute ||
		!slotForm.period ||
		!slotForm.endHour ||
		!slotForm.endMinute ||
		!slotForm.endPeriod ||
		!slotForm.sessionLengthMinutes;

	const resetApplicationForm = () => {
		setFormData({
			name: user?.name || "",
			email: user?.email || "",
			course: "",
			bio: "",
		});
		setAvailability([]);
		resetSlotForm();
	};

	const handleOpenModal = () => {
		resetApplicationForm();
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		resetApplicationForm();
		if (location.state) {
			navigate(location.pathname, { replace: true, state: null });
		}
	};

	useEffect(() => {
		if (!location.state?.openNewApplication) return;
		resetApplicationForm();
		setIsModalOpen(true);
	}, [location.state]);

	const formatAvailabilitySlot = (slot) =>
		`${slot.day}: ${slot.startTime} - ${slot.endTime} • ${slot.sessionLengthMinutes} min sessions`;

	const columns = useMemo(
		() => [
			{ key: "course", header: "Course" },
			{
				key: "status",
				header: "Status",
				render: (application) => {
					const status = application.status || "pending";
					return (
						<Badge className={STATUS_VARIANTS[status] || STATUS_VARIANTS.pending}>
							{status}
						</Badge>
					);
				},
			},
			{
				key: "availability",
				header: "Availability",
				render: (application) =>
					application.availability?.length
						? `${application.availability.length} slot(s)`
						: "-",
			},
			{
				key: "createdAt",
				header: "Submitted",
				render: (application) =>
					application.createdAt
						? new Date(application.createdAt).toLocaleDateString()
						: "-",
			},
			{
				key: "adminNotes",
				header: "Admin Notes",
				render: (application) => application.adminNotes || "No notes yet",
			},
		],
		[],
	);

	return (
		<Layout
			page={sidebarRole}
			title="Tutor Applications"
			subtitle="Review your submitted tutor applications and create a new one when needed."
			buttonText="New Application"
			onButtonClick={handleOpenModal}>
			<Card>
				<CardContent className="p-6">
					<h2 className="mb-4 text-lg font-bold text-slate-900">
						My Applications
					</h2>
					<DataTable
						columns={columns}
						data={tutorApplications}
						isLoading={isApplicationsLoading}
						emptyTitle="No tutor applications yet"
						emptyText='Click "New Application" to submit your first tutor application.'
					/>
				</CardContent>
			</Card>

			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title="Submit Tutor Application"
				size="lg">
				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-1.5">
						<Label>Name</Label>
						<Input type="text" name="name" value={formData.name} readOnly required />
					</div>

					<div className="flex flex-col gap-1.5">
						<Label>Email</Label>
						<Input type="email" name="email" value={formData.email} readOnly required />
					</div>

					<div className="flex flex-col gap-1.5">
						<Label>Course You Want to Teach</Label>
						<Input
							type="text"
							name="course"
							value={formData.course}
							onChange={handleChange}
							placeholder="Example: CSCI 4710 - Database Systems"
							required
						/>
					</div>

					<div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
						<div className="flex flex-col gap-1">
							<Label>Availability Slots</Label>
							<p className="text-sm text-slate-500">
								Choose the day, the time range you are available, and how long
								each student session should be.
							</p>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label>Day Available</Label>
							<select
								className={selectClass}
								name="day"
								value={slotForm.day}
								onChange={handleSlotChange}>
								<option value="">Select day</option>
								{DAYS?.map((day) => (
									<option key={day} value={day}>
										{day}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label>Start Time</Label>
							<div className="flex flex-wrap items-center gap-2">
								<select
									className={selectClass + " w-auto"}
									name="hour"
									value={slotForm.hour}
									onChange={handleSlotChange}>
									<option value="">Hour</option>
									{HOURS.map((hour) => (
										<option key={hour} value={hour}>
											{hour}
										</option>
									))}
								</select>
								<select
									className={selectClass + " w-auto"}
									name="minute"
									value={slotForm.minute}
									onChange={handleSlotChange}>
									{MINUTES.map((minute) => (
										<option key={minute} value={minute}>
											{minute}
										</option>
									))}
								</select>
								<select
									className={selectClass + " w-auto"}
									name="period"
									value={slotForm.period}
									onChange={handleSlotChange}>
									{PERIODS.map((period) => (
										<option key={period} value={period}>
											{period}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label>End Time</Label>
							<div className="flex flex-wrap items-center gap-2">
								<select
									className={selectClass + " w-auto"}
									name="endHour"
									value={slotForm.endHour}
									onChange={handleSlotChange}>
									<option value="">Hour</option>
									{HOURS.map((hour) => (
										<option key={hour} value={hour}>
											{hour}
										</option>
									))}
								</select>
								<select
									className={selectClass + " w-auto"}
									name="endMinute"
									value={slotForm.endMinute}
									onChange={handleSlotChange}>
									{MINUTES.map((minute) => (
										<option key={minute} value={minute}>
											{minute}
										</option>
									))}
								</select>
								<select
									className={selectClass + " w-auto"}
									name="endPeriod"
									value={slotForm.endPeriod}
									onChange={handleSlotChange}>
									{PERIODS.map((period) => (
										<option key={period} value={period}>
											{period}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label>Session Length</Label>
							<select
								className={selectClass}
								name="sessionLengthMinutes"
								value={slotForm.sessionLengthMinutes}
								onChange={handleSlotChange}>
								<option value="30">30 minutes</option>
								<option value="45">45 minutes</option>
								<option value="60">60 minutes</option>
								<option value="90">90 minutes</option>
								<option value="120">120 minutes</option>
							</select>
						</div>

						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								onClick={handleAddAvailability}
								disabled={isSlotIncomplete}>
								{editingIndex !== null ? "Save Slot" : "Add Availability Slot"}
							</Button>
							{editingIndex !== null && (
								<Button type="button" variant="outline" onClick={resetSlotForm}>
									Cancel Edit
								</Button>
							)}
						</div>
					</div>

					{availability.length > 0 && (
						<div className="flex flex-col gap-2">
							{availability.map((slot, index) => (
								<div
									key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}
									className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
									<span className="text-sm text-slate-700">
										{formatAvailabilitySlot(slot)}
									</span>
									<div className="flex gap-2">
										<Button
											type="button"
											size="sm"
											onClick={() => handleEditAvailability(index)}>
											Edit
										</Button>
										<Button
											type="button"
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

					<div className="flex flex-col gap-1.5">
						<Label>Short Bio</Label>
						<textarea
							className="flex min-h-[96px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
							name="bio"
							value={formData.bio}
							onChange={handleChange}
							placeholder="Write a short summary about your tutoring strength."
							rows="4"
							required
						/>
					</div>

					<Button type="submit" disabled={isPending} className="w-full">
						{isPending ? "Submitting..." : "Submit Application"}
					</Button>
				</form>
			</Modal>
		</Layout>
	);
}

export default TutorApply;
