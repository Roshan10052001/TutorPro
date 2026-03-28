import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import SessionCard from '../components/SessionCard'
import PageHeader from '../components/PageHeader'
import { useApp } from '../context/AppContext'
import '../styles/dashboard.css'

function TutorDashboard() {
  const navigate = useNavigate()
  const {
    tutors,
    sessions,
    currentUserEmail,
    updateTutorAvailability
  } = useApp()

  const myTutorProfile = tutors.find(
    (tutor) => tutor.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()
  )

  const mySessions = sessions.filter((session) => {
    return myTutorProfile ? session.tutor === myTutorProfile.name : false
  })

  const handleAvailabilitySave = () => {
    if (!myTutorProfile) {
      navigate('/tutor-apply')
      return
    }

    const currentText = myTutorProfile.availability?.join('\n') || ''
    const newSlots = window.prompt(
      'Update your slots. Put one slot per line.',
      currentText
    )

    if (newSlots !== null) {
      updateTutorAvailability(currentUserEmail, newSlots)
      alert('Availability updated successfully!')
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="Tutor" />

      <main className="dashboard-main">
        <PageHeader
          title="Tutor Dashboard"
          subtitle="Manage your tutor profile, availability, and student bookings."
          buttonText={myTutorProfile ? 'Update Availability' : 'Apply as Tutor'}
          onClick={handleAvailabilitySave}
        />

        <section className="stats-grid">
          <StatCard
            title="Approval Status"
            value={myTutorProfile ? 'Approved' : 'Pending / Not Approved'}
            subtitle="Admin controlled"
          />
          <StatCard
            title="My Sessions"
            value={mySessions.length}
            subtitle="Booked by students"
          />
          <StatCard
            title="Available Slots"
            value={myTutorProfile ? myTutorProfile.availability.length : 0}
            subtitle="Open for booking"
          />
        </section>

        <section className="dashboard-panel enhanced-panel">
          <h2>My Tutor Status</h2>
          {myTutorProfile ? (
            <>
              <p><strong>Course:</strong> {myTutorProfile.course}</p>
              <p><strong>Bio:</strong> {myTutorProfile.bio}</p>
              <div className="slot-section">
                <strong>Availability</strong>
                {myTutorProfile.availability.length === 0 ? (
                  <p className="muted-text">No active slots. Update your availability.</p>
                ) : (
                  <ul className="slot-list">
                    {myTutorProfile.availability.map((slot, index) => (
                      <li key={index}>{slot}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className="empty-inline-state">
              <p>You are not approved yet. Submit your tutor application first.</p>
              <button
                className="primary-btn"
                onClick={() => navigate('/tutor-apply')}
              >
                Go to Tutor Application
              </button>
            </div>
          )}
        </section>

        <section className="dashboard-panel enhanced-panel">
          <h2>My Bookings</h2>
          {mySessions.length === 0 ? (
            <p>No student bookings yet.</p>
          ) : (
            mySessions.map((session) => (
              <SessionCard
                key={session.id}
                course={session.course}
                tutor={`Student: ${session.student}`}
                time={session.time}
                status={session.status}
              />
            ))
          )}
        </section>
      </main>
    </div>
  )
}

export default TutorDashboard