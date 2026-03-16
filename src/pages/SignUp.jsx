import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/auth.css'

function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Account created successfully! Frontend demo only.')
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main className="auth-page">
        <div className="auth-card glass-card">
          <h1>Create Account</h1>
          <p>Join Tutor Pro and start learning smarter.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <label>SLU Email</label>
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
              placeholder="Create your password"
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

            <button type="submit" className="primary-btn full-width">Sign Up</button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default SignUp