import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { DAYS, HOURS, MINUTES, PERIODS, warnAlert } from "../utils";
import { useContext } from "react";
import { AuthContext } from "../context";
import {
	useGetTutorApplications,
	useSubmitTutorApplication,
} from "../hooks/tutorApplication";

function TutorApply() {
	const { user } = useContext(AuthContext);
	const { data: tutorApplications = [] } = useGetTutorApplications();
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

	const buildSlotLabel = () =>
		`${slotForm.day} - ${slotForm.hour}:${slotForm.minute} ${slotForm.period}`;

	const resetSlotForm = () => {
		setSlotForm({
			day: "",
			hour: "",
			minute: "00",
			period: "AM",
		});
		setEditingIndex(null);
	};

	const handleAddAvailability = () => {
		if (
			!slotForm.day ||
			!slotForm.hour ||
			!slotForm.minute ||
			!slotForm.period
		) {
			warnAlert("Please select a day and time.");
			return;
		}

		const slot = buildSlotLabel();

		const duplicateExists = availability.some(
			(existingSlot, index) => existingSlot === slot && index !== editingIndex,
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
		const [day, timePart] = slot.split(" - ");
		const [time, period] = timePart.split(" ");
		const [hour, minute] = time.split(":");

		setSlotForm({
			day: day || "",
			hour: hour || "",
			minute: minute || "00",
			period: period || "AM",
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
	};

	const isSlotIncomplete =
		!slotForm.day || !slotForm.hour || !slotForm.minute || !slotForm.period;

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
	};

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
		<div className='dashboard-layout'>
			<Sidebar role={sidebarRole} />

			<main className='dashboard-main'>
				<PageHeader
					title='Tutor Applications'
					subtitle='Review your submitted tutor applications and create a new one when needed.'
					buttonText='New Application'
					onClick={handleOpenModal}
				/>

				<section className='dashboard-panel enhanced-panel'>
					<h2>My Applications</h2>
					<DataTable
						columns={columns}
						data={tutorApplications}
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
							onChange={handleChange}
							required
						/>

						<label>Email</label>
						<input
							type='email'
							name='email'
							value={formData.email}
							onChange={handleChange}
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

						<label>Availability Slots</label>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "12px",
								marginBottom: "12px",
							}}>
							<div>
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
									alignItems: "center",
									gap: "8px",
									marginBottom: "12px",
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

							<div style={{ display: "flex", gap: "8px", width: "50%" }}>
								<button
									type='button'
									className='primary-btn'
									onClick={handleAddAvailability}
									disabled={isSlotIncomplete}
									style={{
										opacity: isSlotIncomplete ? 0.6 : 1,
										cursor: isSlotIncomplete ? "not-allowed" : "pointer",
									}}>
									{editingIndex !== null ? "Save Slot" : "Add Slot"}
								</button>
								{editingIndex !== null && (
									<button
										type='button'
										onClick={resetSlotForm}
										style={{
											backgroundColor: "#6b7280",
											color: "#fff",
											border: "none",
											padding: "10px 14px",
											cursor: "pointer",
										}}>
										Cancel Edit
									</button>
								)}
							</div>
						</div>

						{availability.length > 0 && (
							<div style={{ marginBottom: "16px" }}>
								{availability.map((slot, index) => (
									<div
										key={`${slot}-${index}`}
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											marginBottom: "8px",
											padding: "10px 12px",
											border: "1px solid #ddd",
											borderRadius: "8px",
											gap: "12px",
										}}>
										<span>{slot}</span>

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
			</main>
		</div>
	);
}

export default TutorApply;
