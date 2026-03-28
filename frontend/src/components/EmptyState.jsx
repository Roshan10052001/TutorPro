function EmptyState({ title, text }) {
  return (
    <div className="dashboard-panel empty-state">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

export default EmptyState