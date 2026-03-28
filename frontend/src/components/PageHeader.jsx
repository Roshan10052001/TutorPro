function PageHeader({ title, subtitle, buttonText, onClick }) {
  return (
    <div className="dashboard-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {buttonText && (
        <button className="primary-btn" onClick={onClick}>
          {buttonText}
        </button>
      )}
    </div>
  )
}

export default PageHeader