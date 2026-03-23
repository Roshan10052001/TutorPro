import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/auth.css";
import { hooks } from "../../hooks";
import { errorAlert, successAlert } from "../../utils";

function SignUp() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "student",
	});

	const {
		mutate: signup,
		isSuccess,
		isError,
		reset,
		error,
	} = hooks.useSignup();

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		signup(formData);
	};

	if (isSuccess) {
		reset();
		if (formData.role === "student") navigate("/student-dashboard");
		if (formData.role === "tutor") navigate("/tutor-dashboard");
		if (formData.role === "admin") navigate("/admin-dashboard");
		successAlert("Signed up successfully");
	}
	if (isError) {
		errorAlert(error);
		reset();
	}

	return (
		<div className='page-shell'>
			<Navbar />

			<main className='auth-page'>
				<div className='auth-card glass-card'>
					<h1>Create Account</h1>
					<p>Join Tutor Pro and start learning smarter.</p>

					<form
						onSubmit={handleSubmit}
						className='auth-form'>
						<label>Full Name</label>
						<input
							type='text'
							name='name'
							placeholder='Enter your full name'
							value={formData.name}
							onChange={handleChange}
							required
						/>

						<label>SLU Email</label>
						<input
							type='email'
							name='email'
							placeholder='Enter your SLU email'
							value={formData.email}
							onChange={handleChange}
							required
						/>

						<label>Password</label>
						<input
							type='password'
							name='password'
							placeholder='Create your password'
							value={formData.password}
							onChange={handleChange}
							required
						/>

						<label>Role</label>
						<select
							name='role'
							value={formData.role}
							onChange={handleChange}>
							<option value='student'>Student</option>
							<option value='tutor'>Tutor</option>
							<option value='admin'>Admin</option>
						</select>

						<button
							type='submit'
							className='primary-btn full-width'>
							Sign Up
						</button>
					</form>

					<p className='auth-footer'>
						Already have an account? <Link to='/signin'>Sign in</Link>
					</p>
				</div>
			</main>
		</div>
	);
}

export default SignUp;
