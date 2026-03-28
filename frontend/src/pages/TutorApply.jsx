import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useApp } from '../context/AppContext'

function TutorApply() {
  const { submitTutorApplication, currentUserEmail, currentUserName } = useApp()

  const [formData, setFormData] = useState({
    name: currentUserName,
    email: currentUserEmail,
    course: '',
    availabilityText: '',
    bio: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const availability = formData.availabilityText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    if (availability.length === 0) {
      alert('Please add at least one availability slot.')
      return
    }

    const result = submitTutorApplication({
      name: formData.name.trim(),
      email: formData.email.trim(),
      course: formData.course.trim(),
      availability,
      bio: formData.bio.trim()
    })

    alert(result.message)

    if (!result.ok) return

    setFormData({
      name: currentUserName,
      email: currentUserEmail,
      course: '',
      availabilityText: '',
      bio: ''
    })
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="Tutor" />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Apply as Tutor</h1>
            <p>Submit your teaching course, availability, and profile for admin approval.</p>
          </div>
        </div>

        <section className="dashboard-panel form-panel enhanced-panel">
          <form className="booking-form" onSubmit={handleSubmit}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Course You Want to Teach</label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="Example: CSCI 4710 - Database Systems"
              required
            />

            <label>Availability Slots</label>
            <textarea
              name="availabilityText"
              value={formData.availabilityText}
              onChange={handleChange}
              placeholder={`Example:
Monday - 5:00 PM
Wednesday - 6:00 PM
Friday - 3:30 PM`}
              rows="5"
              required
            />

            <label>Short Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write a short summary about your tutoring strength."
              rows="4"
              required
            />

            <button type="submit" className="primary-btn">
              Submit Application
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default TutorApply