import Sidebar from '../components/Sidebar'
import SessionCard from '../components/SessionCard'
import EmptyState from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { useCurrentUserProfile } from '../hooks/auth'

function Sessions() {
  const { sessions, tutors } = useApp()
  const { currentUserRole, currentUserEmail } = useCurrentUserProfile()

  const sidebarRole =
    currentUserRole === 'admin'
      ? 'Admin'
      : currentUserRole === 'tutor'
      ? 'Tutor'
      : 'Student'

  const myTutorProfile = tutors.find(
    (tutor) => tutor.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()
  )

  let filteredSessions = sessions

  if (currentUserRole === 'student') {
    filteredSessions = sessions.filter(
      (session) => session.studentEmail.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()
    )
  }

  if (currentUserRole === 'tutor') {
    filteredSessions = myTutorProfile
      ? sessions.filter((session) => session.tutor === myTutorProfile.name)
      : []
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role={sidebarRole} />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>
              {currentUserRole === 'admin'
                ? 'All Sessions'
                : currentUserRole === 'tutor'
                ? 'Tutor Sessions'
                : 'My Sessions'}
            </h1>
            <p>View the session list based on your role.</p>
          </div>
        </div>

        <section className="dashboard-panel enhanced-panel">
          <h2>Session List</h2>
          {filteredSessions.length === 0 ? (
            <EmptyState
              title="No sessions available"
              text="Your session list is empty right now."
            />
          ) : (
            filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                course={session.course}
                tutor={
                  currentUserRole === 'student'
                    ? `Tutor: ${session.tutor}`
                    : `Student: ${session.student}`
                }
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

export default Sessions
