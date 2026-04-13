import { Link } from 'react-router-dom'
import { useContext, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context'
import '../styles/auth.css'

function Logout() {
  const { logout } = useContext(AuthContext)

  useEffect(() => {
    logout()
  }, [logout])

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
