import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import { useGetAllTutorApplications } from "../hooks/tutorApplication";
import { useGetBookings } from "../hooks/booking";
import TutorApplicationManagementTable from "../components/admin/TutorApplicationManagementTable";
import "../styles/dashboard.css";

function AdminDashboard() {
	const {
		data: applications = [],
		isPending: isApplicationsLoading,
	} = useGetAllTutorApplications();
	const { data: sessions = [] } = useGetBookings();

	const pendingApplications = applications.filter(
		(item) => item.status === "pending",
	);
	const approvedCount = applications.filter(
		(item) => item.status === "approved",
	).length;
	const rejectedCount = applications.filter(
		(item) => item.status === "rejected",
	).length;
	const approvedApplications = applications.filter(
		(item) => item.status === "approved",
	);

	return (
		<Layout
			page='Admin'
			title='Admin Dashboard'
			subtitle='Review tutor applications, approve tutors, and monitor platform activity.'>
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

			<TutorApplicationManagementTable
				applications={pendingApplications}
				isLoading={isApplicationsLoading}
				heading='Tutor Approval Requests'
				emptyTitle='No pending applications'
				emptyText='All tutor requests have been reviewed.'
			/>

			<TutorApplicationManagementTable
				applications={approvedApplications}
				isLoading={isApplicationsLoading}
				heading='Approved Tutor Profiles'
				emptyTitle='No approved tutors yet'
				emptyText='Approved tutor profiles will appear here for account management.'
				viewMode='approved'
			/>

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

		</Layout>
	);
}

export default AdminDashboard;
