import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/home.css'

function Home() {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="home-page">
        <section className="hero-section">
          <div className="hero-content glass-card">
            <span className="hero-badge">SLU-focused academic support</span>
            <h1>
              Meet <span>Tutor Pro</span>
            </h1>
            <p>
              A smart peer-to-peer tutoring platform that helps Saint Louis University students
              find trusted tutors, book sessions, and learn with confidence.
            </p>

            <div className="hero-buttons">
              <Link to="/signin" className="primary-btn">Get Started</Link>
              <Link to="/signup" className="secondary-btn">Create Account</Link>
            </div>
          </div>

          <div className="hero-panel glass-card">
            <h3>Why Tutor Pro?</h3>
            <ul>
              <li>Verified peer tutors</li>
              <li>Course-specific search</li>
              <li>Easy booking and scheduling</li>
              <li>Ratings and feedback</li>
              <li>Admin approval system</li>
            </ul>
          </div>
        </section>

        <section className="feature-grid">
          <div className="feature-card glass-card">
            <h3>Students</h3>
            <p>Search tutors by course, review ratings, and book support in minutes.</p>
          </div>

          <div className="feature-card glass-card">
            <h3>Tutors</h3>
            <p>Build your academic profile, manage availability, and grow your credibility.</p>
          </div>

          <div className="feature-card glass-card">
            <h3>Admins</h3>
            <p>Approve tutors, monitor quality, and keep the platform trusted and structured.</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home