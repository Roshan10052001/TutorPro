import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCurrentUserProfile } from '../hooks/auth'
import '../styles/home.css'

function Home() {
  const { currentUser, currentUserRole, isLoggedIn } = useCurrentUserProfile()

  const dashboardPath =
    currentUserRole === 'admin'
      ? '/admin-dashboard'
      : currentUserRole === 'tutor'
      ? '/tutor-dashboard'
      : '/student-dashboard'

  return (
    <div className="page-shell">
      <Navbar />

      <main className="home-page">
        <div className="home-container">
          <section className="hero-section">
            <div className="hero-content">
              <h1>Smart peer tutoring for a better campus learning experience.</h1>
              <p>
                Tutor Pro helps students connect with approved tutors, book real
                time slots, and manage sessions in one clean platform. Tutors can
                apply, share their availability, and support students with a more
                organized flow. Admins can review applications and keep the whole
                system running smoothly.
              </p>

              <div className="hero-actions">
                {isLoggedIn ? (
                  <>
                    <Link to={dashboardPath} className="primary-btn">
                      Go to Dashboard
                    </Link>

                    {currentUserRole === 'student' && (
                      <Link to="/tutors" className="secondary-btn">
                        Browse Tutors
                      </Link>
                    )}

                    {currentUserRole === 'tutor' && (
                      <Link to="/tutor-apply" className="secondary-btn">
                        Apply as Tutor
                      </Link>
                    )}

                    {currentUserRole === 'admin' && (
                      <Link to="/admin-dashboard" className="secondary-btn">
                        Review Requests
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/signup" className="primary-btn">
                      Create Account
                    </Link>
                    <Link to="/signin" className="secondary-btn">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="hero-card">
              <h3>Why Tutor Pro works better</h3>
              <p>
                Students only see approved tutors. Tutors manage their real
                available slots. Admins control approvals before any tutor becomes
                visible in the system. This makes booking cleaner, safer, and more
                realistic for a university tutoring platform.
              </p>
            </div>
          </section>

          <section className="features-section">
            <div className="feature-card">
              <h3>Approved Tutor Flow</h3>
              <p>
                Tutors first apply, then admin reviews and approves. Only after
                approval do they appear for students.
              </p>
            </div>

            <div className="feature-card">
              <h3>Slot Based Booking</h3>
              <p>
                Students can choose from the tutor’s actual available timing, so
                the booking process feels direct and organized.
              </p>
            </div>

            <div className="feature-card">
              <h3>Better Role Management</h3>
              <p>
                Students, tutors, and admins each get their own dashboard flow,
                making the platform easy to understand and use.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Home
