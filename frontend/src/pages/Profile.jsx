import { useContext, useState } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context";
import { useUpdateUserProfile } from "../hooks/user";
import { useConfirm } from "../components/ConfirmProvider";
import { MAJORS, SUBJECT_OPTIONS, YEARS } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const selectClass =
	"flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

function Profile() {
	const { user, effectiveRole, activeView, updateUser } = useContext(AuthContext);
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
	const confirm = useConfirm();

	const sidebarRole =
		effectiveRole === "admin"
			? "Admin"
			: effectiveRole === "tutor"
				? "Tutor"
				: "Student";

	const formattedRole = user?.role
		? user?.role.charAt(0).toUpperCase() + user?.role.slice(1)
		: "User";

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
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
		const ok = await confirm({
			title: "Confirmation",
			description: "Are you sure you want to edit this profile?",
		});
		if (!ok) return;
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
			//error handled in hook
		}
	};

	const renderField = (label, children) => (
		<div className="flex flex-col gap-1.5">
			<Label className="text-xs uppercase tracking-wide text-slate-500">
				{label}
			</Label>
			{children}
		</div>
	);

	const renderReadOnly = (value) => (
		<div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
			{value || "Not provided"}
		</div>
	);

	return (
		<Layout
			page={sidebarRole}
			title="Profile"
			subtitle="Manage your account and personal details."
			buttonText={isEditing ? "Cancel" : "Edit Profile"}
			onButtonClick={() => setIsEditing(!isEditing)}>
			<Card className="mb-6">
				<CardContent className="p-6">
					<h2 className="mb-4 text-lg font-bold text-slate-900">
						Basic Information
					</h2>
					<div className="grid gap-5 sm:grid-cols-2">
						{renderField(
							"Name",
							isEditing ? (
								<Input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
								/>
							) : (
								renderReadOnly(formData.name)
							),
						)}
						{renderField("Email", renderReadOnly(formData.email))}
						{renderField(
							"Phone",
							isEditing ? (
								<Input
									type="text"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
								/>
							) : (
								renderReadOnly(formData.phone)
							),
						)}
						{renderField(
							"Address",
							isEditing ? (
								<Input
									type="text"
									name="address"
									value={formData.address}
									onChange={handleChange}
								/>
							) : (
								renderReadOnly(formData.address)
							),
						)}
						{renderField("Role", renderReadOnly(formattedRole))}
						{user?.role === "tutor"
							? renderField(
								"Current View",
								renderReadOnly(activeView === "student" ? "Student" : "Tutor"),
							)
							: null}
						{renderField("University", renderReadOnly("Saint Louis University"))}
					</div>
				</CardContent>
			</Card>

			{effectiveRole === "student" && (
				<Card className="mb-6">
					<CardContent className="p-6">
						<h2 className="mb-4 text-lg font-bold text-slate-900">
							Student Details
						</h2>
						<div className="grid gap-5 sm:grid-cols-2">
							{renderField(
								"Major",
								isEditing ? (
									<select
										className={selectClass}
										name="major"
										value={formData.major}
										onChange={handleChange}>
										<option value="">Select Major</option>
										{MAJORS.map((major) => (
											<option key={major} value={major}>
												{major}
											</option>
										))}
									</select>
								) : (
									renderReadOnly(formData.major)
								),
							)}
							{renderField(
								"Year",
								isEditing ? (
									<select
										className={selectClass}
										name="year"
										value={formData.year}
										onChange={handleChange}>
										<option value="">Select Year</option>
										{YEARS.map((year) => (
											<option key={year} value={year}>
												{year}
											</option>
										))}
									</select>
								) : (
									renderReadOnly(formData.year)
								),
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{effectiveRole === "tutor" && (
				<Card className="mb-6">
					<CardContent className="p-6">
						<h2 className="mb-4 text-lg font-bold text-slate-900">
							Tutor Details
						</h2>
						<div className="grid gap-5 sm:grid-cols-2">
							{renderField(
								"Subjects",
								isEditing ? (
									<div className="flex flex-col gap-2">
										{SUBJECT_OPTIONS.map((subject) => (
											<label
												key={subject}
												className="flex items-center gap-2 text-sm text-slate-700">
												<input
													type="checkbox"
													className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
													checked={formData.subjects.includes(subject)}
													onChange={() => handleSubjectChange(subject)}
												/>
												{subject}
											</label>
										))}
									</div>
								) : (
									renderReadOnly(
										formData.subjects.length > 0
											? formData.subjects.join(", ")
											: "",
									)
								),
							)}
							{renderField(
								"Experience (years)",
								isEditing ? (
									<Input
										type="text"
										name="experience"
										value={formData.experience}
										onChange={handleChange}
									/>
								) : (
									renderReadOnly(formData.experience)
								),
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{isEditing && (
				<div className="mb-6 flex justify-end">
					<Button onClick={handleSave} disabled={isPending}>
						{isPending ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			)}

			<Card>
				<CardContent className="p-6">
					<h2 className="mb-4 text-lg font-bold text-slate-900">
						Account Actions
					</h2>
					<div className="flex flex-wrap gap-3">
						<Button variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50">
							Change Password
						</Button>
						<Button variant="destructive">Delete Account</Button>
					</div>
				</CardContent>
			</Card>
		</Layout>
	);
}

export default Profile;
