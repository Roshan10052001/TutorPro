import { useContext, useState } from "react";
import "../styles/Profile.css";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context";
import { useUpdateUserProfile } from "../hooks/user";
import Swal from "sweetalert2";
import { MAJORS, SUBJECT_OPTIONS, YEARS } from "../utils";

function Profile() {
	const { user, updateUser } = useContext(AuthContext);
	console.log(user);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
		phone: user?.phone || "",
		address: user?.address || "",
		major: user?.major || "",
		year: user?.year || "",
		subjects: user?.subjects || [],
		experience: user?.experience || "",
	});

	const { mutateAsync: updateProfile, isPending } = useUpdateUserProfile();

	const sidebarRole =
		user?.role === "admin"
			? "Admin"
			: user?.role === "tutor"
				? "Tutor"
				: "Student";

	const formattedRole = user?.role
		? user?.role.charAt(0).toUpperCase() + user?.role.slice(1)
		: "User";

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubjectChange = (subject) => {
		setFormData((prev) => {
			const alreadySelected = prev.subjects.includes(subject);

			return {
				...prev,
				subjects: alreadySelected
					? prev.subjects.filter((item) => item !== subject)
					: [...prev.subjects, subject],
			};
		});
	};

	const handleSave = async () => {
		const result = await Swal.fire({
			title: "Confirmation",
			text: "Are you sure you want to edit this profile?",
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "Cancel",
			reverseButtons: true,
		});

		if (!result.isConfirmed) return;
		try {
			const updatedUser = await updateProfile({
				name: formData.name,
				email: formData.email,
				phone: formData.phone || "",
				address: formData.address || "",
				major: formData.major || "",
				year: formData.year || "",
				subjects: formData.subjects || [],
				experience: formData.experience || "",
			});
			setFormData({
				name: updatedUser.name || "",
				email: updatedUser.email || "",
				phone: updatedUser.phone || "",
				address: updatedUser.address || "",
				major: updatedUser.major || "",
				year: updatedUser.year || "",
				subjects: updatedUser.subjects || [],
				experience: updatedUser.experience || "",
			});
			updateUser(updatedUser);
			setIsEditing(false);
		} catch {
			//error handled in hook, just reset pending state here
		}
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

				{user?.role === "student" && (
					<section className='dashboard-panel profile-card'>
						<h2>Student Details</h2>

						<div className='profile-grid'>
							<div className='profile-field'>
								<label className='profile-label'>Major</label>
								{isEditing ? (
									<select
										className='profile-input'
										name='major'
										value={formData.major}
										onChange={handleChange}>
										<option value=''>Select Major</option>
										{MAJORS.map((major) => (
											<option
												key={major}
												value={major}>
												{major}
											</option>
										))}
									</select>
								) : (
									<div className='profile-value'>
										{formData.major || "Not provided"}
									</div>
								)}
							</div>

							<div className='profile-field'>
								<label className='profile-label'>Year</label>
								{isEditing ? (
									<select
										className='profile-input'
										name='year'
										value={formData.year}
										onChange={handleChange}>
										<option value=''>Select Year</option>
										{YEARS.map((year) => (
											<option
												key={year}
												value={year}>
												{year}
											</option>
										))}
									</select>
								) : (
									<div className='profile-value'>
										{formData.year || "Not provided"}
									</div>
								)}
							</div>
						</div>
					</section>
				)}

				{user?.role === "tutor" && (
					<section className='dashboard-panel profile-card'>
						<h2>Tutor Details</h2>

						<div className='profile-grid'>
							<div className='profile-field'>
								<label className='profile-label'>Subjects</label>

								{isEditing ? (
									<div className='checkbox-group'>
										{SUBJECT_OPTIONS.map((subject) => (
											<label
												key={subject}
												style={{ display: "block" }}>
												<input
													type='checkbox'
													checked={formData.subjects.includes(subject)}
													onChange={() => handleSubjectChange(subject)}
												/>{" "}
												{subject}
											</label>
										))}
									</div>
								) : (
									<div className='profile-value'>
										{formData.subjects.length > 0
											? formData.subjects.join(", ")
											: "Not provided"}
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
							{isPending ? "Saving..." : "Save Changes"}
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
