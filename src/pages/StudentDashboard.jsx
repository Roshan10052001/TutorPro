import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import SessionCard from '../components/SessionCard'
import '../styles/dashboard.css'

function StudentDashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar role="Student" />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Student Dashboard</h1>
            <p>Find tutors, manage bookings, and track learning progress.</p>
          </div>
          <button className="primary-btn">Book a Session</button>
        </div>

        <section className="stats-grid">
          <StatCard title="Upcoming Sessions" value="4" subtitle="This week" />
          <StatCard title="Completed Sessions" value="18" subtitle="This semester" />
          <StatCard title="Favorite Subject" value="Math" subtitle="Highest activity" />
        </section>

        <section className="dashboard-panel" id="sessions">
          <h2>Upcoming Sessions</h2>
          <SessionCard
            course="CSCI 5030 - Software Engineering"
            tutor="Tutor: Prince Karikari"
            time="Tuesday, 4:00 PM"
            status="Booked"
          />
          <SessionCard
            course="CSCI 4710 - Database Systems"
            tutor="Tutor: Pelumi Oluwategbe"
            time="Thursday, 6:00 PM"
            status="Confirmed"
          />
        </section>
      </main>
    </div>
  )
}

export default StudentDashboard