import Layout from "../components/Layout";
import TutorApplicationManagementTable from "../components/admin/TutorApplicationManagementTable";
import { useGetAllTutorApplications } from "../hooks/tutorApplication";

function AdminTutorAccounts() {
	const {
		data: applications = [],
		isPending: isApplicationsLoading,
	} = useGetAllTutorApplications();

	const approvedApplications = applications.filter(
		(application) => application.status === "approved",
	);

	return (
		<Layout
			page='Admin'
			title='Manage Tutors'
			subtitle='Manage approved tutor profiles, reverse tutor roles, and delete tutor accounts.'>
			<TutorApplicationManagementTable
				applications={approvedApplications}
				isLoading={isApplicationsLoading}
				heading='Approved Tutor Profiles'
				emptyTitle='No approved tutor accounts yet'
				emptyText='Approved tutor accounts will appear here for admin management.'
				viewMode='approved'
			/>
		</Layout>
	);
}

export default AdminTutorAccounts;
