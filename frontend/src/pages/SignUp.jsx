import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context";
import { useSignup } from "../hooks/auth";
import { errorAlert } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

function SignUp() {
	const navigate = useNavigate();
	const { authenticate } = useContext(AuthContext);
	const { mutateAsync: signupMutateAsync } = useSignup();

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "student",
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			alert("Passwords do not match.");
			return;
		}

		try {
			const result = await signupMutateAsync({
				name: formData.name,
				email: formData.email,
				password: formData.password,
				role: formData.role,
			});
			if (result?.user) {
				authenticate({ ...result.user, token: result.token || "" });
			}
			navigate("/signin");
		} catch (error) {
			errorAlert(error);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/60">
			<Navbar />
			<main className="flex items-center justify-center px-4 py-10 sm:py-16">
				<Card className="w-full max-w-md shadow-xl">
					<CardContent className="p-8">
						<h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
							Create Account
						</h1>
						<p className="mt-2 mb-6 text-slate-600">
							Create a student or tutor account to start using Tutor Pro.
						</p>

						<form
							onSubmit={handleSubmit}
							className="flex flex-col gap-4">
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									type="text"
									name="name"
									placeholder="Enter your name"
									value={formData.name}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									name="email"
									placeholder="Enter your email"
									value={formData.email}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									name="password"
									placeholder="Create password"
									value={formData.password}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<Label htmlFor="confirmPassword">Confirm Password</Label>
								<Input
									id="confirmPassword"
									type="password"
									name="confirmPassword"
									placeholder="Confirm password"
									value={formData.confirmPassword}
									onChange={handleChange}
									required
								/>
							</div>

							<Button
								type="submit"
								className="mt-2 w-full">
								Create Account
							</Button>
						</form>

						<p className="mt-6 text-center text-sm text-slate-600">
							Already have an account?{" "}
							<Link
								to="/signin"
								className="font-bold text-blue-600 hover:underline">
								Sign In
							</Link>
						</p>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}

export default SignUp;
