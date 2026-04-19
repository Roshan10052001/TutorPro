import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context";
import "../styles/auth.css";

function Logout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const confirmLogout = async () => {
      const result = await Swal.fire({
        title: "Confirmation",
        text: "Are you sure you want to log out?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!isMounted) return;

      if (result.isConfirmed) {
        logout();
        return;
      }

      navigate(-1);
    };

    confirmLogout();

    return () => {
      isMounted = false;
    };
  }, [logout, navigate]);

  return (
    <div className="page-shell">
      <Navbar />
      <main className="auth-page">
        <div className="auth-card glass-card logout-card">
          <h1>You have been signed out</h1>
          <p>Thank you for using Tutor Pro.</p>
          <Link
            to="/signin"
            className="primary-btn">
            Sign In Again
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Logout;
