import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, ShieldCheck, Users } from "lucide-react";
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
				role: "student",
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
		<div className='min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)]'>
			<Navbar />
			<main className='mx-auto grid min-h-[calc(100vh-78px)] max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center'>
				<section>
					<div className='inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur'>
						<Users className='h-4 w-4' />
						Create your tutoring workspace
					</div>
					{/* <h1 className='mt-6 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl'>
						Join Tutor Pro as a student or tutor in a few quick steps.
					</h1> */}
					<h1 className='mt-6 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl'>
						Join Tutor Pro and start learning or apply to tutor in a few quick
						steps.
					</h1>
					<p className='mt-5 max-w-2xl text-lg leading-8 text-slate-600'>
						Start booking support, offering sessions, and managing academic help
						in one organized platform.
					</p>

					<div className='mt-8 grid gap-4'>
						<div className='flex items-start gap-4 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60 backdrop-blur'>
							<div className='rounded-2xl bg-blue-50 p-3 text-blue-600'>
								<ShieldCheck className='h-6 w-6' />
							</div>
							<div>
								<p className='font-bold text-slate-900'>
									Trusted tutor approval
								</p>
								{/* <p className='mt-1 text-sm text-slate-600'>
									Tutors apply first and become visible after review.
								</p> */}
								<p className='mt-1 text-sm text-slate-600'>
									Students can apply to become tutors and are reviewed before
									being approved.
								</p>
							</div>
						</div>
						<div className='flex items-start gap-4 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60 backdrop-blur'>
							<div className='rounded-2xl bg-indigo-50 p-3 text-indigo-600'>
								<GraduationCap className='h-6 w-6' />
							</div>
							<div>
								<p className='font-bold text-slate-900'>
									Role-focused experience
								</p>
								<p className='mt-1 text-sm text-slate-600'>
									Get dashboards and actions that match how you use the
									platform.
								</p>
							</div>
						</div>
					</div>
				</section>

				<Card className='w-full border-white/70 bg-white/82 shadow-2xl shadow-blue-900/10 backdrop-blur'>
					<CardContent className='p-8 sm:p-9'>
						<div className='inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700'>
							New account
						</div>
						<h1 className='mt-4 text-3xl font-extrabold tracking-tight text-slate-900'>
							Create Account
						</h1>
						<p className='mt-2 mb-6 text-slate-600'>
							Create a student or tutor account to start using Tutor Pro.
						</p>

						<form
							onSubmit={handleSubmit}
							className='flex flex-col gap-4'>
							{/* <div className="flex flex-col gap-1.5">
								<Label>I am joining as</Label>
								<div className="grid gap-3 sm:grid-cols-2">
									<button
										type="button"
										onClick={() =>
											setFormData((prev) => ({ ...prev, role: "student" }))
										}
										className={`rounded-2xl border p-4 text-left transition ${
											formData.role === "student"
												? "border-blue-500 bg-blue-50 text-blue-900"
												: "border-slate-200 bg-white text-slate-700 hover:border-blue-200"
										}`}>
										<p className="font-bold">Student</p>
										<p className="mt-1 text-sm text-slate-500">
											Find tutors and book support sessions.
										</p>
									</button>
									<button
										type="button"
										onClick={() =>
											setFormData((prev) => ({ ...prev, role: "tutor" }))
										}
										className={`rounded-2xl border p-4 text-left transition ${
											formData.role === "tutor"
												? "border-blue-500 bg-blue-50 text-blue-900"
												: "border-slate-200 bg-white text-slate-700 hover:border-blue-200"
										}`}>
										<p className="font-bold">Tutor</p>
										<p className="mt-1 text-sm text-slate-500">
											Apply for courses and manage availability.
										</p>
									</button>
								</div>
							</div> */}

							<div className='flex flex-col gap-1.5'>
								<Label htmlFor='name'>Name</Label>
								<Input
									id='name'
									type='text'
									name='name'
									placeholder='Enter your name'
									value={formData.name}
									onChange={handleChange}
									required
									className='h-11 rounded-xl border-slate-200 bg-white'
								/>
							</div>

							<div className='flex flex-col gap-1.5'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									name='email'
									placeholder='Enter your email'
									value={formData.email}
									onChange={handleChange}
									required
									className='h-11 rounded-xl border-slate-200 bg-white'
								/>
							</div>

							<div className='grid gap-4 sm:grid-cols-2'>
								<div className='flex flex-col gap-1.5'>
									<Label htmlFor='password'>Password</Label>
									<Input
										id='password'
										type='password'
										name='password'
										placeholder='Create password'
										value={formData.password}
										onChange={handleChange}
										required
										className='h-11 rounded-xl border-slate-200 bg-white'
									/>
								</div>

								<div className='flex flex-col gap-1.5'>
									<Label htmlFor='confirmPassword'>Confirm Password</Label>
									<Input
										id='confirmPassword'
										type='password'
										name='confirmPassword'
										placeholder='Confirm password'
										value={formData.confirmPassword}
										onChange={handleChange}
										required
										className='h-11 rounded-xl border-slate-200 bg-white'
									/>
								</div>
							</div>

							<Button
								type='submit'
								className='mt-2 h-11 w-full rounded-xl'>
								Create Account
								<ArrowRight className='h-4 w-4' />
							</Button>
						</form>

						<p className='mt-6 text-center text-sm text-slate-600'>
							Already have an account?{" "}
							<Link
								to='/signin'
								className='font-bold text-blue-600 hover:underline'>
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
