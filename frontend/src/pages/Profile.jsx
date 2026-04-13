import { useState } from "react";
import "../styles/Profile.css";
import Sidebar from "../components/Sidebar";
import { useCurrentUserProfile } from "../hooks/auth";

function Profile() {
	const { currentUserEmail, currentUserRole, currentUserName } =
		useCurrentUserProfile();

	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: currentUserName || "",
		email: currentUserEmail || "",
		phone: "",
		address: "",
		major: "",
		year: "",
		subjects: "",
		experience: "",
	});

	const sidebarRole =
		currentUserRole === "admin"
			? "Admin"
			: currentUserRole === "tutor"
				? "Tutor"
				: "Student";

	const formattedRole = currentUserRole
		? currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)
		: "User";

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSave = () => {
		console.log("Saved profile:", formData);
		setIsEditing(false);
	};

	return (
		<div className='dashboard-layout'>
			<Sidebar role={sidebarRole} />

			<main className='dashboard-main'>
				<div className='dashboard-header'>
					<div>
						<h1>Profile</h1>
						<p>Manage your account and personal details.</p>
					</div>

					<button
						className='btn-secondary'
						onClick={() => setIsEditing(!isEditing)}>
						{isEditing ? "Cancel" : "Edit Profile"}
					</button>
				</div>

				<section className='dashboard-panel profile-card'>
					<h2>Basic Information</h2>

					<div className='profile-grid'>
						<div className='profile-field'>
							<label className='profile-label'>Name</label>
							{isEditing ? (
								<input
									className='profile-input'
									type='text'
									name='name'
									value={formData.name}
									onChange={handleChange}
								/>
							) : (
								<div className='profile-value'>
									{formData.name || "Not provided"}
								</div>
							)}
						</div>

						<div className='profile-field'>
							<label className='profile-label'>Email</label>
							{isEditing ? (
								<input
									className='profile-input'
									type='email'
									name='email'
									value={formData.email}
									onChange={handleChange}
								/>
							) : (
								<div className='profile-value'>
									{formData.email || "Not provided"}
								</div>
							)}
						</div>

						<div className='profile-field'>
							<label className='profile-label'>Phone</label>
							{isEditing ? (
								<input
									className='profile-input'
									type='text'
									name='phone'
									value={formData.phone}
									onChange={handleChange}
								/>
							) : (
								<div className='profile-value'>
									{formData.phone || "Not provided"}
								</div>
							)}
						</div>

						<div className='profile-field'>
							<label className='profile-label'>Address</label>
							{isEditing ? (
								<input
									className='profile-input'
									type='text'
									name='address'
									value={formData.address}
									onChange={handleChange}
								/>
							) : (
								<div className='profile-value'>
									{formData.address || "Not provided"}
								</div>
							)}
						</div>

						<div className='profile-field'>
							<label className='profile-label'>Role</label>
							<div className='profile-value'>{formattedRole}</div>
						</div>

						<div className='profile-field'>
							<label className='profile-label'>University</label>
							<div className='profile-value'>Saint Louis University</div>
						</div>
					</div>
				</section>

				{currentUserRole === "student" && (
					<section className='dashboard-panel profile-card'>
						<h2>Student Details</h2>

						<div className='profile-grid'>
							<div className='profile-field'>
								<label className='profile-label'>Major</label>
								{isEditing ? (
									<input
										className='profile-input'
										type='text'
										name='major'
										value={formData.major}
										onChange={handleChange}
									/>
								) : (
									<div className='profile-value'>
										{formData.major || "Not provided"}
									</div>
								)}
							</div>

							<div className='profile-field'>
								<label className='profile-label'>Year</label>
								{isEditing ? (
									<input
										className='profile-input'
										type='text'
										name='year'
										value={formData.year}
										onChange={handleChange}
									/>
								) : (
									<div className='profile-value'>
										{formData.year || "Not provided"}
									</div>
								)}
							</div>
						</div>
					</section>
				)}

				{currentUserRole === "tutor" && (
					<section className='dashboard-panel profile-card'>
						<h2>Tutor Details</h2>

						<div className='profile-grid'>
							<div className='profile-field'>
								<label className='profile-label'>Subjects</label>
								{isEditing ? (
									<input
										className='profile-input'
										type='text'
										name='subjects'
										value={formData.subjects}
										onChange={handleChange}
									/>
								) : (
									<div className='profile-value'>
										{formData.subjects || "Not provided"}
									</div>
								)}
							</div>

							<div className='profile-field'>
								<label className='profile-label'>Experience (years)</label>
								{isEditing ? (
									<input
										className='profile-input'
										type='text'
										name='experience'
										value={formData.experience}
										onChange={handleChange}
									/>
								) : (
									<div className='profile-value'>
										{formData.experience || "Not provided"}
									</div>
								)}
							</div>
						</div>
					</section>
				)}

				{isEditing && (
					<div className='profile-actions'>
						<button
							className='btn-primary'
							onClick={handleSave}>
							Save Changes
						</button>
					</div>
				)}

				<section className='dashboard-panel profile-card'>
					<h2>Account Actions</h2>
					<div className='account-actions'>
						<button className='btn-warning'>Change Password</button>
						<button className='btn-danger'>Delete Account</button>
					</div>
				</section>
			</main>
		</div>
	);
}

export default Profile;
