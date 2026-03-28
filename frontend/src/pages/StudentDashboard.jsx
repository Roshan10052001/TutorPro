import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import SessionCard from '../components/SessionCard'
import PageHeader from '../components/PageHeader'
import { useApp } from '../context/AppContext'
import '../styles/dashboard.css'

function StudentDashboard() {
  const navigate = useNavigate()
  const { sessions, approvedTutors, currentUserEmail } = useApp()

  const studentSessions = sessions.filter(
    (session) => session.studentEmail === currentUserEmail
  )

  return (
    <div className="dashboard-layout">
      <Sidebar role="Student" />

      <main className="dashboard-main">
        <PageHeader
          title="Student Dashboard"
          subtitle="Find approved tutors, book slots, and manage your sessions."
          buttonText="Book a Session"
          onClick={() => navigate('/book-session')}
        />

        <section className="stats-grid">
          <StatCard
            title="Approved Tutors"
            value={approvedTutors.length}
            subtitle="Available to book"
          />
          <StatCard
            title="My Sessions"
            value={studentSessions.length}
            subtitle="Current bookings"
          />
          <StatCard
            title="Open Booking Flow"
            value="Active"
            subtitle="Tutor slot based"
          />
        </section>

        <section className="dashboard-panel">
          <h2>My Upcoming Sessions</h2>
          {studentSessions.length === 0 ? (
            <p>No sessions booked yet.</p>
          ) : (
            studentSessions.map((session) => (
              <SessionCard
                key={session.id}
                course={session.course}
                tutor={`Tutor: ${session.tutor}`}
                time={session.time}
                status={session.status}
              />
            ))
          )}
        </section>

        <section className="dashboard-panel">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <button className="secondary-btn" onClick={() => navigate('/tutors')}>
              Browse Tutors
            </button>
            <button className="secondary-btn" onClick={() => navigate('/book-session')}>
              Book by Slot
            </button>
            <button className="secondary-btn" onClick={() => navigate('/sessions')}>
              View Sessions
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default StudentDashboard