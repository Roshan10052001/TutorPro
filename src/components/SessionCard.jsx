function SessionCard({ course, tutor, time, status }) {
  return (
    <div className="session-card">
      <div>
        <h3>{course}</h3>
        <p>{tutor}</p>
      </div>
      <div>
        <p>{time}</p>
        <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
      </div>
    </div>
  )
}

export default SessionCard