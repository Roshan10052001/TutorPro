import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import { useGetAllTutorApplications } from "../hooks/tutorApplication";
import { useGetBookings } from "../hooks/booking";
import TutorApplicationManagementTable from "../components/admin/TutorApplicationManagementTable";
import { Card, CardContent } from "@/components/ui/card";

function AdminDashboard() {
	const { data: applications = [], isPending: isApplicationsLoading } =
		useGetAllTutorApplications();
	const { data: sessions = [] } = useGetBookings();

	const pendingApplications = applications.filter(
		(item) => item.status === "pending"
	);
	const approvedCount = applications.filter(
		(item) => item.status === "approved"
	).length;
	const rejectedCount = applications.filter(
		(item) => item.status === "rejected"
	).length;
	const approvedApplications = applications.filter(
		(item) => item.status === "approved"
	);

	return (
		<Layout
			page="Admin"
			title="Admin Dashboard"
			subtitle="Review tutor applications, approve tutors, and monitor platform activity.">
			<section className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				<StatCard
					title="Pending Tutors"
					value={pendingApplications.length}
					subtitle="Awaiting approval"
				/>
				<StatCard
					title="Approved Tutors"
					value={approvedCount}
					subtitle="Visible to students"
				/>
				<StatCard
					title="Total Sessions"
					value={sessions.length}
					subtitle="Platform bookings"
				/>
			</section>

			<TutorApplicationManagementTable
				applications={pendingApplications}
				isLoading={isApplicationsLoading}
				heading="Tutor Approval Requests"
				emptyTitle="No pending applications"
				emptyText="All tutor requests have been reviewed."
			/>

			<TutorApplicationManagementTable
				applications={approvedApplications}
				isLoading={isApplicationsLoading}
				heading="Approved Tutor Profiles"
				emptyTitle="No approved tutors yet"
				emptyText="Approved tutor profiles will appear here for account management."
				viewMode="approved"
			/>

			<Card>
				<CardContent className="p-6">
					<h2 className="mb-4 text-lg font-bold text-slate-900">
						Platform Summary
					</h2>
					<div className="grid gap-4 sm:grid-cols-3">
						<div className="rounded-xl bg-blue-50 p-5 text-center">
							<h3 className="text-3xl font-extrabold text-blue-700">
								{approvedCount}
							</h3>
							<p className="mt-1 text-sm text-slate-600">Approved tutors</p>
						</div>
						<div className="rounded-xl bg-rose-50 p-5 text-center">
							<h3 className="text-3xl font-extrabold text-rose-700">
								{rejectedCount}
							</h3>
							<p className="mt-1 text-sm text-slate-600">Rejected applications</p>
						</div>
						<div className="rounded-xl bg-emerald-50 p-5 text-center">
							<h3 className="text-3xl font-extrabold text-emerald-700">
								{sessions.length}
							</h3>
							<p className="mt-1 text-sm text-slate-600">Total booked sessions</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</Layout>
	);
}

export default AdminDashboard;
