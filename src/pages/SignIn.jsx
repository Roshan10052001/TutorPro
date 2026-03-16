import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/auth.css'

function SignIn() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (formData.role === 'student') navigate('/student-dashboard')
    if (formData.role === 'tutor') navigate('/tutor-dashboard')
    if (formData.role === 'admin') navigate('/admin-dashboard')
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main className="auth-page">
        <div className="auth-card glass-card">
          <h1>Sign In</h1>
          <p>Welcome back to Tutor Pro.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your SLU email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit" className="primary-btn full-width">Sign In</button>
          </form>

          <p className="auth-footer">
            Don’t have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default SignIn