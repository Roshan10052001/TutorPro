import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import EmptyState from '../components/EmptyState'
import { useApp } from '../context/AppContext'

function Tutors() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { approvedTutors } = useApp()

  const filteredTutors = useMemo(() => {
    return approvedTutors.filter(
      (tutor) =>
        tutor.name.toLowerCase().includes(search.toLowerCase()) ||
        tutor.course.toLowerCase().includes(search.toLowerCase())
    )
  }, [approvedTutors, search])

  return (
    <div className="dashboard-layout">
      <Sidebar role="Student" />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Find Tutors</h1>
            <p>Browse only admin-approved tutors and their available time slots.</p>
          </div>
        </div>

        <section className="dashboard-panel enhanced-panel">
          <input
            type="text"
            className="search-input"
            placeholder="Search by tutor name or course"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        {filteredTutors.length === 0 ? (
          <EmptyState
            title="No tutors found"
            text="Try another search or wait for admin-approved tutors."
          />
        ) : (
          <section className="card-grid">
            {filteredTutors.map((tutor) => (
              <div className="dashboard-panel tutor-card enhanced-panel" key={tutor.id}>
                <div className="tutor-card-header">
                  <div>
                    <h3>{tutor.name}</h3>
                    <p className="course-line">{tutor.course}</p>
                  </div>
                  <span className="soft-badge approved">★ {tutor.rating}</span>
                </div>

                <p>{tutor.bio}</p>

                <div className="slot-section">
                  <strong>Available Slots</strong>
                  {tutor.availability.length === 0 ? (
                    <p className="muted-text">No slots open right now.</p>
                  ) : (
                    <ul className="slot-list">
                      {tutor.availability.map((slot, index) => (
                        <li key={index}>{slot}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  className="primary-btn"
                  onClick={() => navigate('/book-session')}
                  disabled={tutor.availability.length === 0}
                >
                  {tutor.availability.length === 0 ? 'No Slots Available' : 'Book Now'}
                </button>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default Tutors