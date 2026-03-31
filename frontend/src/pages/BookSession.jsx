import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import EmptyState from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { useCurrentUserProfile } from '../hooks/auth'

function BookSession() {
  const { approvedTutors, bookSession } = useApp()
  const { currentUserEmail, currentUserName } = useCurrentUserProfile()

  const [formData, setFormData] = useState({
    tutorName: '',
    course: '',
    slot: '',
    note: ''
  })

  const availableTutors = useMemo(
    () => approvedTutors.filter((tutor) => tutor.availability.length > 0),
    [approvedTutors]
  )

  const selectedTutor = useMemo(
    () => availableTutors.find((tutor) => tutor.name === formData.tutorName),
    [availableTutors, formData.tutorName]
  )

  useEffect(() => {
    if (selectedTutor) {
      setFormData((prev) => ({
        ...prev,
        course: selectedTutor.course,
        slot: ''
      }))
    }
  }, [selectedTutor])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.tutorName || !formData.slot) {
      alert('Please select tutor and time slot.')
      return
    }

    const result = bookSession({
      course: formData.course,
      tutorName: formData.tutorName,
      studentName: currentUserName,
      studentEmail: currentUserEmail,
      slot: formData.slot,
      note: formData.note
    })

    alert(result.message)

    if (!result.ok) return

    setFormData({
      tutorName: '',
      course: '',
      slot: '',
      note: ''
    })
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="Student" />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Book a Session</h1>
            <p>Select an approved tutor and book one open time slot.</p>
          </div>
        </div>

        {availableTutors.length === 0 ? (
          <EmptyState
            title="No bookable tutors yet"
            text="There are no approved tutors with open slots right now."
          />
        ) : (
          <section className="dashboard-panel form-panel enhanced-panel">
            <form className="booking-form" onSubmit={handleSubmit}>
              <label>Select Tutor</label>
              <select
                name="tutorName"
                value={formData.tutorName}
                onChange={handleChange}
                required
              >
                <option value="">Choose tutor</option>
                {availableTutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.name}>
                    {tutor.name} - {tutor.course}
                  </option>
                ))}
              </select>

              <label>Course</label>
              <input type="text" value={formData.course} readOnly />

              <label>Available Slot</label>
              <select
                name="slot"
                value={formData.slot}
                onChange={handleChange}
                required
                disabled={!selectedTutor}
              >
                <option value="">Choose time slot</option>
                {selectedTutor &&
                  selectedTutor.availability.map((slot, index) => (
                    <option key={index} value={slot}>
                      {slot}
                    </option>
                  ))}
              </select>

              <label>Note</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Write a short note for the tutor"
                rows="4"
              />

              <button type="submit" className="primary-btn">
                Confirm Booking
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  )
}

export default BookSession
