import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/auth.css";
import { hooks } from "../../hooks";
import { errorAlert, successAlert } from "../../utils";

function SignIn() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		role: "student",
	});

	const { mutate: login, isSuccess, isError, reset, error } = hooks.useLogin();

	const [errors, setErrors] = useState({});
	const [showPassword, setShowPassword] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });

		// clear error while typing
		setErrors((prev) => ({
			...prev,
			[name]: "",
		}));
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!formData.email.endsWith("@slu.edu")) {
			newErrors.email = "Please enter a valid SLU email";
		}

		if (!formData.password.trim()) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!validateForm()) return;
		login(formData);
	};

	if (isSuccess) {
		reset();
		if (formData.role === "student") navigate("/student-dashboard");
		if (formData.role === "tutor") navigate("/tutor-dashboard");
		if (formData.role === "admin") navigate("/admin-dashboard");
		successAlert("Signed in successfully");
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
					<h1>Sign In</h1>
					<p>Welcome back to Tutor Pro.</p>

					<form
						onSubmit={handleSubmit}
						className='auth-form'>
						<label>Email</label>
						<input
							type='email'
							name='email'
							placeholder='Enter your SLU email'
							value={formData.email}
							onChange={handleChange}
						/>
						{errors.email && <span className='error-text'>{errors.email}</span>}

						<label>Password</label>
						<div className='password-wrapper'>
							<input
								type={showPassword ? "text" : "password"}
								name='password'
								placeholder='Enter your password'
								value={formData.password}
								onChange={handleChange}
							/>
							<button
								type='button'
								className='toggle-password-btn'
								onClick={() => setShowPassword(!showPassword)}>
								{showPassword ? "Hide" : "Show"}
							</button>
						</div>
						{errors.password && (
							<span className='error-text'>{errors.password}</span>
						)}

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
							Sign In
						</button>
					</form>

					<p className='auth-footer'>
						Don’t have an account? <Link to='/signup'>Create one</Link>
					</p>
				</div>
			</main>
		</div>
	);
}

export default SignIn;
