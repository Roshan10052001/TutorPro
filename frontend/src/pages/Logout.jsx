import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import '../styles/auth.css'

function Logout() {
  const { logoutUser } = useApp()

  useEffect(() => {
    logoutUser()
  }, [logoutUser])

  return (
    <div className="page-shell">
      <Navbar />
      <main className="auth-page">
        <div className="auth-card glass-card logout-card">
          <h1>You have been signed out</h1>
          <p>Thank you for using Tutor Pro.</p>
          <Link to="/signin" className="primary-btn">Sign In Again</Link>
        </div>
      </main>
    </div>
  )
}

export default Logout
