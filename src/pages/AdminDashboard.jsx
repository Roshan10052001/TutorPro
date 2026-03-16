import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import SessionCard from '../components/SessionCard'
import '../styles/dashboard.css'

function AdminDashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar role="Admin" />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Monitor approvals, tutor quality, and platform activity.</p>
          </div>
          <button className="primary-btn">Review Applications</button>
        </div>

        <section className="stats-grid">
          <StatCard title="Pending Tutors" value="8" subtitle="Awaiting approval" />
          <StatCard title="Active Users" value="126" subtitle="Across platform" />
          <StatCard title="Reported Issues" value="2" subtitle="Needs action" />
        </section>

        <section className="dashboard-panel" id="feedback">
          <h2>Recent Activity</h2>
          <SessionCard
            course="Tutor Approval Request"
            tutor="Student: New tutor applicant"
            time="Submitted today"
            status="Pending"
          />
          <SessionCard
            course="Feedback Review"
            tutor="Rating issue reported"
            time="Yesterday"
            status="Open"
          />
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard