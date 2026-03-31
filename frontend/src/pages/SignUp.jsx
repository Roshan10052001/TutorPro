import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSignup } from '../hooks/auth'
import '../styles/auth.css'

function SignUp() {
  const navigate = useNavigate()
  const { mutateAsync: signupMutateAsync } = useSignup()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.')
      return
    }

    try {
      await signupMutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      navigate('/signin')
    } catch (error) {
      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Unable to create account.'
      )
    }
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main className="auth-page">
        <div className="auth-card glass-card">
          <h1>Create Account</h1>
          <p>Create a student or tutor account to start using Tutor Pro.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
            </select>

            <button type="submit" className="primary-btn full-width">
              Create Account
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default SignUp
