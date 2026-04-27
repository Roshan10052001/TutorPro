import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { DAYS, HOURS, MINUTES, PERIODS, warnAlert } from "../utils";
import { useContext } from "react";
import { AuthContext } from "../context";
import {
	useGetTutorApplications,
	useSubmitTutorApplication,
	useUpdateTutorApplication,
} from "../hooks/tutorApplication";
import { useConfirm } from "../components/ConfirmProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buildSlotLabel, convertToMinutes } from "@/utils/functions";

const STATUS_VARIANTS = {
	pending: "bg-amber-100 text-amber-800",
	approved: "bg-emerald-100 text-emerald-800",
	rejected: "bg-rose-100 text-rose-800",
	changes_requested: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS = {
	pending: "pending",
	approved: "approved",
	rejected: "rejected",
	changes_requested: "changes requested",
};

const selectClass =
	"flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const truncateText = (value, maxLength = 30) => {
	if (!value?.trim()) return "No notes yet";

	const text = value.trim();
	return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

function TutorApply() {
	const { user } = useContext(AuthContext);
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const { data: tutorApplications = [], isPending: isApplicationsLoading } =
		useGetTutorApplications();
	const { mutateAsync, isPending, reset } = useSubmitTutorApplication();
	const {
		mutateAsync: updateApplication,
		isPending: isUpdating,
		reset: resetUpdate,
	} = useUpdateTutorApplication();
	const confirm = useConfirm();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedApplication, setSelectedApplication] = useState(null);
	const applicationIdFromUrl = searchParams.get("application");

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
	const [editingApplicationId, setEditingApplicationId] = useState(null);

	const sidebarRole = user?.role === "tutor" ? "Tutor" : "Student";

	const handleChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSlotChange = (e) => {
		setSlotForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

		const slot = buildSlotLabel(slotForm);
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

		const ok = await confirm({
			title: "Confirmation",
			description: "Are you sure you want to submit this application?",
		});
		if (!ok) return;
		const payload = {
			name: formData.name.trim(),
			email: formData.email.trim(),
			course: formData.course.trim(),
			availability,
			bio: formData.bio.trim(),
		};

		try {
			if (editingApplicationId) {
				await updateApplication({
					id: editingApplicationId,
					...payload,
				});
				resetUpdate();
			} else {
				await mutateAsync(payload);
				reset();
			}
			setFormData({
				name: user?.name || "",
				email: user?.email || "",
				course: "",
				bio: "",
			});
			setAvailability([]);
			setEditingApplicationId(null);
			resetSlotForm();
			setIsModalOpen(false);
			handleCloseApplication();
		} catch {
			reset();
			resetUpdate();
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
		setEditingIndex(null);
		setEditingApplicationId(null);
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

	const handleOpenApplication = useCallback((application) => {
		setSelectedApplication(application);
	}, []);

	const handleCloseApplication = () => {
		setSelectedApplication(null);
		if (applicationIdFromUrl) {
			setSearchParams((params) => {
				const nextParams = new URLSearchParams(params);
				nextParams.delete("application");
				return nextParams;
			});
		}
	};

	const handleEditApplication = (application) => {
		setEditingApplicationId(application._id);

		setFormData({
			name: application.name || user?.name || "",
			email: application.email || user?.email || "",
			course: application.course || "",
			bio: application.bio || "",
		});

		setAvailability(application.availability || []);
		setSelectedApplication(null);
		setIsModalOpen(true);
	};

	useEffect(() => {
		if (!location.state?.openNewApplication) return;
		resetApplicationForm();
		setIsModalOpen(true);
	}, [location.state]);

	useEffect(() => {
		if (!applicationIdFromUrl || !tutorApplications.length) return;

		const application = tutorApplications.find(
			(item) => item._id === applicationIdFromUrl,
		);

		if (application) {
			setSelectedApplication(application);
		}
	}, [applicationIdFromUrl, tutorApplications]);

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
						<Badge
							className={STATUS_VARIANTS[status] || STATUS_VARIANTS.pending}>
							{STATUS_LABELS[status] || status}
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
				render: (application) => truncateText(application.adminNotes),
			},
			{
				key: "actions",
				header: "Action",
				render: (application) => (
					<Button
						type='button'
						size='sm'
						onClick={() => handleOpenApplication(application)}>
						View
					</Button>
				),
			},
		],
		[handleOpenApplication],
	);

	return (
		<Layout
			page={sidebarRole}
			title='Tutor Applications'
			subtitle='Review your submitted tutor applications and create a new one when needed.'
			buttonText='New Application'
			onButtonClick={handleOpenModal}>
			<Card>
				<CardContent className='p-6'>
					<h2 className='mb-4 text-lg font-bold text-slate-900'>
						My Applications
					</h2>
					<DataTable
						columns={columns}
						data={tutorApplications}
						isLoading={isApplicationsLoading}
						emptyTitle='No tutor applications yet'
						emptyText='Click "New Application" to submit your first tutor application.'
					/>
				</CardContent>
			</Card>

			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={
					editingApplicationId
						? "Edit Tutor Application"
						: "Submit Tutor Application"
				}
				size='lg'>
				<form
					className='flex flex-col gap-4'
					onSubmit={handleSubmit}>
					<div className='flex flex-col gap-1.5'>
						<Label>Name</Label>
						<Input
							type='text'
							name='name'
							value={formData.name}
							readOnly
							required
						/>
					</div>

					<div className='flex flex-col gap-1.5'>
						<Label>Email</Label>
						<Input
							type='email'
							name='email'
							value={formData.email}
							readOnly
							required
						/>
					</div>

					<div className='flex flex-col gap-1.5'>
						<Label>Course You Want to Teach</Label>
						<Input
							type='text'
							name='course'
							value={formData.course}
							onChange={handleChange}
							placeholder='Example: CSCI 4710 - Database Systems'
							required
						/>
					</div>

					<div className='flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4'>
						<div className='flex flex-col gap-1'>
							<Label>Availability Slots</Label>
							<p className='text-sm text-slate-500'>
								Choose the day, the time range you are available, and how long
								each student session should be.
							</p>
						</div>

						<div className='flex flex-col gap-1.5'>
							<Label>Day Available</Label>
							<select
								className={selectClass}
								name='day'
								value={slotForm.day}
								onChange={handleSlotChange}>
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

						<div className='flex flex-col gap-1.5'>
							<Label>Start Time</Label>
							<div className='flex flex-wrap items-center gap-2'>
								<select
									className={selectClass + " w-auto"}
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
									className={selectClass + " w-auto"}
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
									className={selectClass + " w-auto"}
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
						</div>

						<div className='flex flex-col gap-1.5'>
							<Label>End Time</Label>
							<div className='flex flex-wrap items-center gap-2'>
								<select
									className={selectClass + " w-auto"}
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
									className={selectClass + " w-auto"}
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
									className={selectClass + " w-auto"}
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

						<div className='flex flex-col gap-1.5'>
							<Label>Session Length</Label>
							<select
								className={selectClass}
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

						<div className='flex flex-wrap gap-2'>
							<Button
								type='button'
								onClick={handleAddAvailability}
								disabled={isSlotIncomplete}>
								{editingIndex !== null ? "Save Slot" : "Add Availability Slot"}
							</Button>
							{editingIndex !== null && (
								<Button
									type='button'
									variant='outline'
									onClick={resetSlotForm}>
									Cancel Edit
								</Button>
							)}
						</div>
					</div>

					{availability.length > 0 && (
						<div className='flex flex-col gap-2'>
							{availability.map((slot, index) => (
								<div
									key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}
									className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5'>
									<span className='text-sm text-slate-700'>
										{formatAvailabilitySlot(slot)}
									</span>
									<div className='flex gap-2'>
										<Button
											type='button'
											size='sm'
											onClick={() => handleEditAvailability(index)}>
											Edit
										</Button>
										<Button
											type='button'
											size='sm'
											variant='destructive'
											onClick={() => handleRemoveAvailability(index)}>
											Remove
										</Button>
									</div>
								</div>
							))}
						</div>
					)}

					<div className='flex flex-col gap-1.5'>
						<Label>Short Bio</Label>
						<textarea
							className='flex min-h-[96px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
							name='bio'
							value={formData.bio}
							onChange={handleChange}
							placeholder='Write a short summary about your tutoring strength.'
							rows='4'
							required
						/>
					</div>

					<Button
						type='submit'
						disabled={isPending || isUpdating}
						className='w-full'>
						{isPending || isUpdating
							? editingApplicationId
								? "Resubmitting..."
								: "Submitting..."
							: editingApplicationId
								? "Resubmit Application"
								: "Submit Application"}
					</Button>
				</form>
			</Modal>

			<Modal
				isOpen={Boolean(selectedApplication)}
				onClose={handleCloseApplication}
				title='Tutor Application Request'
				size='lg'>
				{selectedApplication ? (
					<div className='flex flex-col gap-4'>
						<div className='flex flex-wrap items-center gap-3'>
							<Badge
								className={
									STATUS_VARIANTS[selectedApplication.status || "pending"] ||
									STATUS_VARIANTS.pending
								}>
								{STATUS_LABELS[selectedApplication.status || "pending"] ||
									selectedApplication.status ||
									"pending"}
							</Badge>
							<span className='text-sm text-slate-500'>
								Submitted{" "}
								{selectedApplication.createdAt
									? new Date(selectedApplication.createdAt).toLocaleDateString()
									: "-"}
							</span>
						</div>

						<div className='flex flex-col gap-1.5'>
							<Label>Name</Label>
							<Input
								type='text'
								value={selectedApplication.name}
								readOnly
							/>
						</div>

						<div className='flex flex-col gap-1.5'>
							<Label>Email</Label>
							<Input
								type='email'
								value={selectedApplication.email}
								readOnly
							/>
						</div>

						<div className='flex flex-col gap-1.5'>
							<Label>Course You Want to Teach</Label>
							<Input
								type='text'
								value={selectedApplication.course}
								readOnly
							/>
						</div>

						<div className='flex flex-col gap-1.5'>
							<Label>Bio</Label>
							<textarea
								className='flex min-h-[96px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none'
								value={selectedApplication.bio || ""}
								rows='4'
								readOnly
							/>
						</div>

						<div className='flex flex-col gap-1.5'>
							<Label>Availability</Label>

							{selectedApplication.availability?.length ? (
								<div className='flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3'>
									{selectedApplication.availability.map((slot, index) => (
										<div
											key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}
											className='rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700'>
											{slot.day}: {slot.startTime} - {slot.endTime} •{" "}
											{slot.sessionLengthMinutes} min sessions
										</div>
									))}
								</div>
							) : (
								<div className='rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500'>
									No availability provided.
								</div>
							)}
						</div>

						<div className='flex flex-col gap-1.5'>
							<Label>Admin Comments</Label>
							<div className='min-h-[88px] rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700'>
								{selectedApplication.adminNotes?.trim() ||
									"No admin comments yet."}
							</div>
						</div>
						{selectedApplication.status === "changes_requested" && (
							<Button
								type='button'
								onClick={() => handleEditApplication(selectedApplication)}
								className='w-full'>
								Edit and Resubmit
							</Button>
						)}
					</div>
				) : null}
			</Modal>
		</Layout>
	);
}

export default TutorApply;
