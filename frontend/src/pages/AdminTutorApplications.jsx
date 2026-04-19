import Layout from "../components/Layout";
import TutorApplicationManagementTable from "../components/admin/TutorApplicationManagementTable";
import { useGetAllTutorApplications } from "../hooks/tutorApplication";

function AdminTutorApplications() {
	const {
		data: applications = [],
		isPending: isApplicationsLoading,
	} = useGetAllTutorApplications();

	return (
		<Layout
			page='Admin'
			title='Tutor Applications'
			subtitle='Review pending, approved, and rejected tutor applications in one place.'>
			<TutorApplicationManagementTable
				applications={applications}
				isLoading={isApplicationsLoading}
				heading='All Tutor Applications'
				emptyTitle='No tutor applications yet'
				emptyText='Tutor applications will appear here when students apply.'
			/>
		</Layout>
	);
}

export default AdminTutorApplications;
