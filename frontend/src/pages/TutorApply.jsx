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
		setAvailability((prev) =>
			prev.filter((_, index) => index !== indexToRemove),
		);
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
			//error handled in hook, just reset pending state here
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
			{
				key: "course",
				header: "Course",
			},
			{
				key: "status",
				header: "Status",
				render: (application) => (
					<span className={`status-badge ${application.status || "pending"}`}>
						{application.status || "pending"}
					</span>
				),
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
			title='Tutor Applications'
			subtitle='Review your submitted tutor applications and create a new one when needed.'
			buttonText='New Application'
			onButtonClick={handleOpenModal}>
			<section className='dashboard-panel enhanced-panel'>
				<h2>My Applications</h2>
				<DataTable
					columns={columns}
					data={tutorApplications}
					isLoading={isApplicationsLoading}
					emptyTitle='No tutor applications yet'
					emptyText='Click "New Application" to submit your first tutor application.'
				/>
			</section>

			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title='Submit Tutor Application'
				size='lg'>
				<form
					className='booking-form'
					onSubmit={handleSubmit}>
						<label>Name</label>
						<input
							type='text'
							name='name'
							value={formData.name}
							readOnly
							required
						/>

						<label>Email</label>
						<input
							type='email'
							name='email'
							value={formData.email}
							readOnly
							required
						/>

						<label>Course You Want to Teach</label>
						<input
							type='text'
							name='course'
							value={formData.course}
							onChange={handleChange}
							placeholder='Example: CSCI 4710 - Database Systems'
							required
						/>

						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "16px",
								marginBottom: "16px",
							}}>
							<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
								<label>Availability Slots</label>
								<p style={{ color: "#64748b", fontSize: "0.95rem" }}>
									Choose the day, the time range you are available, and how
									long each student session should be.
								</p>
							</div>

							<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
								<label>Day Available</label>
								<select
									name='day'
									value={slotForm.day}
									onChange={handleSlotChange}
									required={!slotForm}>
									<option value=''>Select day</option>
									{DAYS?.map((day) => (
										<option
											key={day}
											value={day}>
											{day}
										</option>
									))}
								</select>
							</div>

							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "8px",
								}}>
								<label>Start Time</label>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "8px",
										flexWrap: "wrap",
									}}>
									<select
										name='hour'
										value={slotForm.hour}
										onChange={handleSlotChange}
										required={!slotForm}>
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
										onChange={handleSlotChange}
										required={!slotForm}>
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
										onChange={handleSlotChange}
										required={!slotForm}>
										{PERIODS.map((period) => (
											<option
												key={period}
												value={period}>
												{period}
											</option>
										))}
									</select>
								</div>
							</div>

							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "8px",
								}}>
								<label>End Time</label>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "8px",
										flexWrap: "wrap",
									}}>
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
							</div>

							<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
							</div>

							<div
								style={{
									display: "flex",
									gap: "8px",
									flexWrap: "wrap",
								}}>
								<button
									type='button'
									className='primary-btn'
									onClick={handleAddAvailability}
									disabled={isSlotIncomplete}
									style={{
										opacity: isSlotIncomplete ? 0.6 : 1,
										cursor: isSlotIncomplete ? "not-allowed" : "pointer",
									}}>
									{editingIndex !== null
										? "Save Slot"
										: "Add Availability Slot"}
								</button>
								{editingIndex !== null && (
									<button
										type='button'
										className='secondary-btn'
										onClick={resetSlotForm}>
										Cancel Edit
									</button>
								)}
							</div>
						</div>

						{availability.length > 0 && (
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

						<label>Short Bio</label>
						<textarea
							name='bio'
							value={formData.bio}
							onChange={handleChange}
							placeholder='Write a short summary about your tutoring strength.'
							rows='4'
							required
						/>

					<button
						type='submit'
						className='primary-btn'
						disabled={isPending}>
						{isPending ? "Submitting..." : "Submit Application"}
					</button>
				</form>
			</Modal>
		</Layout>
	);
}

export default TutorApply;
