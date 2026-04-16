import { useState } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import Swal from "sweetalert2";
import {
	useGetAllTutorApplications,
	useUpdateTutorApplication,
} from "../hooks/tutorApplication";
import { useSessions } from "../hooks/tutor";
import "../styles/dashboard.css";

function AdminDashboard() {
	const { data: applications = [] } = useGetAllTutorApplications();
	const sessions = useSessions();
	const { mutateAsync: updateTutorApplication, isPending } =
		useUpdateTutorApplication();
	const [adminNotesById, setAdminNotesById] = useState({});
	const [selectedApplication, setSelectedApplication] = useState(null);
	const [activeAction, setActiveAction] = useState("");
	const [activeApplicationId, setActiveApplicationId] = useState("");

	const pendingApplications = applications.filter(
		(item) => item.status === "pending",
	);
	const approvedCount = applications.filter(
		(item) => item.status === "approved",
	).length;
	const rejectedCount = applications.filter(
		(item) => item.status === "rejected",
	).length;
	const isActionPending = isPending;

	const handleNotesChange = (applicationId, value) => {
		setAdminNotesById((prev) => ({
			...prev,
			[applicationId]: value,
		}));
	};

	const handleOpenRequest = (application) => {
		setSelectedApplication(application);
	};

	const handleCloseRequest = () => {
		setSelectedApplication(null);
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

	const columns = [
		{
			key: "name",
			header: "Applicant",
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
					View
				</button>
			),
		},
	];

	return (
		<div className='dashboard-layout'>
			<Sidebar role='Admin' />

			<main className='dashboard-main'>
				<PageHeader
					title='Admin Dashboard'
					subtitle='Review tutor applications, approve tutors, and monitor platform activity.'
				/>

				<section className='stats-grid'>
					<StatCard
						title='Pending Tutors'
						value={pendingApplications.length}
						subtitle='Awaiting approval'
					/>
					<StatCard
						title='Approved Tutors'
						value={approvedCount}
						subtitle='Visible to students'
					/>
					<StatCard
						title='Total Sessions'
						value={sessions.length}
						subtitle='Platform bookings'
					/>
				</section>

				<section className='dashboard-panel'>
					<h2>Tutor Approval Requests</h2>

					{pendingApplications.length === 0 ? (
						<EmptyState
							title='No pending applications'
							text='All tutor requests have been reviewed.'
						/>
					) : (
						<DataTable
							columns={columns}
							data={pendingApplications}
							emptyTitle='No pending applications'
							emptyText='All tutor requests have been reviewed.'
						/>
					)}
				</section>

				<section className='dashboard-panel'>
					<h2>Platform Summary</h2>
					<div className='summary-grid'>
						<div className='summary-box'>
							<h3>{approvedCount}</h3>
							<p>Approved tutors</p>
						</div>
						<div className='summary-box'>
							<h3>{rejectedCount}</h3>
							<p>Rejected applications</p>
						</div>
						<div className='summary-box'>
							<h3>{sessions.length}</h3>
							<p>Total booked sessions</p>
						</div>
					</div>
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
									<li key={`${slot}-${index}`}>{slot}</li>
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
							</div>
						</div>
					) : null}
				</Modal>
			</main>
		</div>
	);
}

export default AdminDashboard;
