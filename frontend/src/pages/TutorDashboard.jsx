import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import SessionCard from '../components/SessionCard'
import '../styles/dashboard.css'

function TutorDashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar role="Tutor" />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Tutor Dashboard</h1>
            <p>Manage your schedule, sessions, and feedback.</p>
          </div>
          <button className="primary-btn">Update Availability</button>
        </div>

        <section className="stats-grid">
          <StatCard title="Sessions This Week" value="7" subtitle="Active tutoring" />
          <StatCard title="Average Rating" value="4.9" subtitle="Student feedback" />
          <StatCard title="Courses Offered" value="5" subtitle="Verified subjects" />
        </section>

        <section className="dashboard-panel" id="bookings">
          <h2>Today’s Bookings</h2>
          <SessionCard
            course="Data Structures"
            tutor="Student: Bijay Kumar Chaudhary"
            time="1:00 PM"
            status="Confirmed"
          />
          <SessionCard
            course="Operating Systems"
            tutor="Student: Guddu Yadav"
            time="3:30 PM"
            status="Booked"
          />
        </section>
      </main>
    </div>
  )
}

export default TutorDashboard