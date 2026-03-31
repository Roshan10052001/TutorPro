import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useLogin } from '../hooks/auth'
import '../styles/auth.css'

function SignIn() {
  const navigate = useNavigate()
  const { mutateAsync: loginMutateAsync } = useLogin()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const result = await loginMutateAsync({
        email: formData.email,
        password: formData.password
      })

      const role = result?.user?.role

      if (role === 'student') navigate('/student-dashboard')
      if (role === 'tutor') navigate('/tutor-dashboard')
      if (role === 'admin') navigate('/admin-dashboard')
    } catch (error) {
      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Invalid email or password.'
      )
      return
    }
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main className="auth-page">
        <div className="auth-card glass-card">
          <h1>Sign In</h1>
          <p>Sign in with your saved account credentials.</p>

          <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="primary-btn full-width">
              Sign In
            </button>
          </form>
{/*
          <div className="demo-admin-box">
            <h3>Admin Demo Login</h3>
            <p><strong>Email:</strong> admin@tutorpro.com</p>
            <p><strong>Password:</strong> Admin123!</p>
          </div>
*/}
          <p className="auth-footer">
            Don’t have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default SignIn
