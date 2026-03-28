import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import '../styles/navbar.css'

function Navbar() {
  const { currentUser, currentUserRole } = useApp()
  const isLoggedIn = Boolean(currentUser)

  const dashboardPath =
    currentUserRole === 'admin'
      ? '/admin-dashboard'
      : currentUserRole === 'tutor'
      ? '/tutor-dashboard'
      : '/student-dashboard'

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-mark">TP</div>
          <h2>Tutor Pro</h2>
        </Link>

        <nav className="navbar-links">
          <Link to="/">Home</Link>

          {isLoggedIn ? (
            <>
              <Link to={dashboardPath}>Dashboard</Link>
              {currentUserRole === 'student' && <Link to="/tutors">Tutors</Link>}
              {currentUserRole === 'tutor' && <Link to="/tutor-apply">Apply</Link>}
              <Link to="/sessions">Sessions</Link>
              <Link to="/profile">Profile</Link>
            </>
          ) : (
            <>
              <Link to="/signin">Sign In</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </nav>

        <div className="navbar-cta">
          {isLoggedIn ? (
            <Link to="/logout" className="primary-btn">
              Logout
            </Link>
          ) : (
            <Link to="/signin" className="primary-btn">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar