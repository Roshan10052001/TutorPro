import { Link } from 'react-router-dom'
import '../styles/navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-logo">TP</div>
        <div>
          <h2>Tutor Pro</h2>
          <p>Smart Peer-to-Peer Academic Support</p>
        </div>
      </div>

      <nav className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/signin">Sign In</Link>
        <Link to="/signup">Sign Up</Link>
      </nav>
    </header>
  )
}

export default Navbar