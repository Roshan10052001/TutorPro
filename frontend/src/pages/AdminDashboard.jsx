import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import '../styles/dashboard.css'

function AdminDashboard() {
  const {
    pendingApplications,
    tutors,
    sessions,
    applications,
    approveTutor,
    rejectTutor,
    resetDemoData
  } = useApp()

  const approvedCount = tutors.filter((item) => item.status === 'approved').length
  const rejectedCount = applications.filter((item) => item.status === 'rejected').length

  return (
    <div className="dashboard-layout">
      <Sidebar role="Admin" />

      <main className="dashboard-main">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Review tutor applications, approve tutors, and monitor platform activity."
          buttonText="Reset Demo Data"
          onClick={resetDemoData}
        />

        <section className="stats-grid">
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

        <section className="dashboard-panel">
          <h2>Tutor Approval Requests</h2>

          {pendingApplications.length === 0 ? (
            <EmptyState
              title="No pending applications"
              text="All tutor requests have been reviewed."
            />
          ) : (
            <div className="approval-list">
              {pendingApplications.map((application) => (
                <div className="approval-card" key={application.id}>
                  <div className="approval-card-top">
                    <div>
                      <h3>{application.name}</h3>
                      <span className="soft-badge pending">Pending</span>
                    </div>
                  </div>

                  <p><strong>Email:</strong> {application.email}</p>
                  <p><strong>Course:</strong> {application.course}</p>
                  <p><strong>Bio:</strong> {application.bio}</p>

                  <div>
                    <strong>Availability:</strong>
                    <ul className="slot-list">
                      {application.availability.map((slot, index) => (
                        <li key={index}>{slot}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="action-grid">
                    <button
                      className="primary-btn"
                      onClick={() => approveTutor(application.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => rejectTutor(application.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <h2>Platform Summary</h2>
          <div className="summary-grid">
            <div className="summary-box">
              <h3>{approvedCount}</h3>
              <p>Approved tutors</p>
            </div>
            <div className="summary-box">
              <h3>{rejectedCount}</h3>
              <p>Rejected applications</p>
            </div>
            <div className="summary-box">
              <h3>{sessions.length}</h3>
              <p>Total booked sessions</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard