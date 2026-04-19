import { useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../DataTable";
import Modal from "../Modal";
import { useUpdateTutorApplication } from "../../hooks/tutorApplication";
import { useDeleteTutor } from "../../hooks/tutor";
import { useDeleteUserAccount } from "../../hooks/user";

function TutorApplicationManagementTable({
	applications = [],
	isLoading = false,
	heading,
	emptyTitle,
	emptyText,
	viewMode = "all",
}) {
	const { mutateAsync: updateTutorApplication, isPending } =
		useUpdateTutorApplication();
	const { mutateAsync: deleteTutor, isPending: isDeletingTutor } =
		useDeleteTutor();
	const { mutateAsync: deleteUserAccount, isPending: isDeletingUser } =
		useDeleteUserAccount();
	const [adminNotesById, setAdminNotesById] = useState({});
	const [selectedApplication, setSelectedApplication] = useState(null);
	const [activeAction, setActiveAction] = useState("");
	const [activeApplicationId, setActiveApplicationId] = useState("");

	const isActionPending = isPending || isDeletingTutor || isDeletingUser;

	const handleOpenRequest = (application) => {
		setSelectedApplication(application);
	};

	const handleCloseRequest = () => {
		setSelectedApplication(null);
	};

	const handleNotesChange = (applicationId, value) => {
		setAdminNotesById((prev) => ({
			...prev,
			[applicationId]: value,
		}));
	};

	const formatAvailabilitySlot = (slot) => {
		if (!slot || typeof slot !== "object") return String(slot || "-");

		return `${slot.day}: ${slot.startTime} - ${slot.endTime} • ${slot.sessionLengthMinutes} min sessions`;
	};

	const handleSubmit = async (application, status) => {
		const actionLabel = status === "approved" ? "approve" : "reject";
		const notes = (
			adminNotesById[application._id] ??
			application.adminNotes ??
			""
		).trim();

		const result = await Swal.fire({
			title: "Confirmation",
			text: `Are you sure you want to ${actionLabel} this application?`,
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "Cancel",
			reverseButtons: true,
		});

		if (!result.isConfirmed) return;

		try {
			setActiveAction(status);
			setActiveApplicationId(application._id);
			await updateTutorApplication({
				applicationId: application._id,
				status,
				adminNotes: notes,
			});
			setSelectedApplication(null);
		} finally {
			setActiveAction("");
			setActiveApplicationId("");
		}
	};

	const handleReverseTutor = async (application) => {
		const result = await Swal.fire({
			title: "Reverse Tutor Role",
			text: "This will remove the tutor profile and change the user back to a student. Continue?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes, reverse it",
			cancelButtonText: "Cancel",
			reverseButtons: true,
		});

		if (!result.isConfirmed) return;

		try {
			setActiveAction("reverse");
			setActiveApplicationId(application._id);
			await deleteTutor(application._id);
			setSelectedApplication(null);
		} finally {
			setActiveAction("");
			setActiveApplicationId("");
		}
	};

	const handleDeleteAccount = async (application) => {
		const userId = application?.user?._id;

		if (!userId) return;

		const result = await Swal.fire({
			title: "Delete Account",
			text: "This will permanently delete the user, their tutor applications, and related bookings.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes, delete account",
			cancelButtonText: "Cancel",
			reverseButtons: true,
		});

		if (!result.isConfirmed) return;

		try {
			setActiveAction("delete-account");
			setActiveApplicationId(application._id);
			await deleteUserAccount(userId);
			setSelectedApplication(null);
		} finally {
			setActiveAction("");
			setActiveApplicationId("");
		}
	};

	const columns = [
		{
			key: "name",
			header: viewMode === "approved" ? "Tutor" : "Applicant",
		},
		{
			key: "email",
			header: "Email",
		},
		{
			key: "course",
			header: "Course",
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
			key: "availability",
			header: "Availability",
			render: (application) =>
				application.availability?.length
					? `${application.availability.length} slot(s)`
					: "-",
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
			key: "actions",
			header: "Action",
			render: (application) => (
				<button
					type='button'
					className='primary-btn'
					onClick={() => handleOpenRequest(application)}>
					{viewMode === "approved" ? "Manage" : "View"}
				</button>
			),
		},
	];

	return (
		<>
			<section className='dashboard-panel'>
				{heading ? <h2>{heading}</h2> : null}
				<DataTable
					columns={columns}
					data={applications}
					isLoading={isLoading}
					emptyTitle={emptyTitle}
					emptyText={emptyText}
				/>
			</section>

			<Modal
				isOpen={Boolean(selectedApplication)}
				onClose={handleCloseRequest}
				title='Tutor Application Request'
				size='lg'>
				{selectedApplication ? (
					<div className='booking-form'>
						<label>Name</label>
						<input
							type='text'
							value={selectedApplication.name}
							readOnly
						/>

						<label>Email</label>
						<input
							type='email'
							value={selectedApplication.email}
							readOnly
						/>

						<label>Course</label>
						<input
							type='text'
							value={selectedApplication.course}
							readOnly
						/>

						<label>Bio</label>
						<textarea
							value={selectedApplication.bio}
							rows='4'
							readOnly
						/>

						<label>Availability</label>
						<ul className='slot-list'>
							{selectedApplication.availability.map((slot, index) => (
								<li key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}>
									{formatAvailabilitySlot(slot)}
								</li>
							))}
						</ul>

						<label>Comments</label>
						<textarea
							value={
								adminNotesById[selectedApplication._id] ??
								selectedApplication.adminNotes ??
								""
							}
							onChange={(event) =>
								handleNotesChange(selectedApplication._id, event.target.value)
							}
							placeholder='Add comments for this application'
							rows='3'
						/>

						<div className='action-grid'>
							{selectedApplication.status === "pending" ||
							selectedApplication.status === "rejected" ? (
								<button
									type='button'
									className='primary-btn'
									onClick={() => handleSubmit(selectedApplication, "approved")}
									disabled={isActionPending}>
									{isPending &&
									activeAction === "approved" &&
									activeApplicationId === selectedApplication._id
										? "Approving..."
										: "Approve"}
								</button>
							) : null}
							{selectedApplication.status === "pending" ? (
								<button
									type='button'
									className='secondary-btn'
									style={{
										color: "red",
										border: "1px solid red",
									}}
									onClick={() => handleSubmit(selectedApplication, "rejected")}
									disabled={isActionPending}>
									{isPending &&
									activeAction === "rejected" &&
									activeApplicationId === selectedApplication._id
										? "Rejecting..."
										: "Reject"}
								</button>
							) : null}
							{selectedApplication.status === "approved" ? (
								<button
									type='button'
									className='secondary-btn'
									onClick={() => handleReverseTutor(selectedApplication)}
									disabled={isActionPending}>
									{isDeletingTutor &&
									activeAction === "reverse" &&
									activeApplicationId === selectedApplication._id
										? "Reversing..."
										: "Change Back to Student"}
								</button>
							) : null}
							<button
								type='button'
								className='secondary-btn'
								style={{
									color: "#b91c1c",
									border: "1px solid #b91c1c",
								}}
								onClick={() => handleDeleteAccount(selectedApplication)}
								disabled={isActionPending}>
								{isDeletingUser &&
								activeAction === "delete-account" &&
								activeApplicationId === selectedApplication._id
									? "Deleting Account..."
									: "Delete Account"}
							</button>
						</div>
					</div>
				) : null}
			</Modal>
		</>
	);
}

export default TutorApplicationManagementTable;
