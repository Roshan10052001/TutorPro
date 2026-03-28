import Sidebar from '../components/Sidebar'
import { useApp } from '../context/AppContext'

function Profile() {
  const { currentUserEmail, currentUserRole, currentUserName } = useApp()

  const sidebarRole =
    currentUserRole === 'admin'
      ? 'Admin'
      : currentUserRole === 'tutor'
      ? 'Tutor'
      : 'Student'

  return (
    <div className="dashboard-layout">
      <Sidebar role={sidebarRole} />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Profile</h1>
            <p>Manage your personal information and account details.</p>
          </div>
        </div>

        <section className="dashboard-panel profile-card">
          <h2>User Information</h2>
          <p><strong>Name:</strong> {currentUserName}</p>
          <p><strong>Email:</strong> {currentUserEmail}</p>
          <p><strong>Role:</strong> {currentUserRole}</p>
          <p><strong>University:</strong> Saint Louis University</p>
        </section>
      </main>
    </div>
  )
}

export default Profile