import { Link } from 'react-router-dom'
import '../styles/sidebar.css'

function Sidebar({ role }) {
  return (
    <aside className="sidebar">
      <h3>{role} Panel</h3>
      <Link to="/">Overview</Link>
      <a href="#sessions">Sessions</a>
      <a href="#bookings">Bookings</a>
      <a href="#feedback">Feedback</a>
      <a href="#profile">Profile</a>
      <Link to="/logout">Logout</Link>
    </aside>
  )
}

export default Sidebar