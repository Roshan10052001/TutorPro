import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, CalendarClock, GraduationCap, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context";
import { useLogin } from "../hooks/auth";
import { errorAlert } from "../utils";
import { BasePaths } from "../routes/path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

function SignIn() {
	const navigate = useNavigate();
	const { authenticate } = useContext(AuthContext);
	const { mutateAsync: loginMutateAsync } = useLogin();

	const [formData, setFormData] = useState({ email: "", password: "" });

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const result = await loginMutateAsync({
				email: formData.email,
				password: formData.password,
			});
			if (result?.user) {
				authenticate({ ...result.user, token: result.token || "" });
			}
			const role = result?.user?.role;
			if (role === "student") navigate(`${BasePaths.STUDENT}/dashboard`);
			if (role === "tutor") navigate("/select-view");
			if (role === "admin") navigate(`${BasePaths.ADMIN}/dashboard`);
		} catch (error) {
			errorAlert(error);
		}
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)]">
			<Navbar />
			<main className="mx-auto grid min-h-[calc(100vh-78px)] max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
				<section className="order-2 lg:order-1">
					<div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur">
						<ShieldCheck className="h-4 w-4" />
						Secure sign in for students, tutors, and admins
					</div>
					<h1 className="mt-6 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
						Pick up right where your tutoring workflow left off.
					</h1>
					<p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
						Check upcoming sessions, manage tutor applications, and keep your
						schedule organized from one place.
					</p>

					<div className="mt-8 grid gap-4 sm:grid-cols-3">
						<div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
							<CalendarClock className="h-8 w-8 text-blue-600" />
							<p className="mt-4 font-bold text-slate-900">Live schedules</p>
							<p className="mt-1 text-sm text-slate-600">
								See booked sessions and open slots quickly.
							</p>
						</div>
						<div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
							<GraduationCap className="h-8 w-8 text-indigo-600" />
							<p className="mt-4 font-bold text-slate-900">Role-based tools</p>
							<p className="mt-1 text-sm text-slate-600">
								Student, tutor, and admin experiences stay focused.
							</p>
						</div>
						<div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60 backdrop-blur">
							<ShieldCheck className="h-8 w-8 text-emerald-600" />
							<p className="mt-4 font-bold text-slate-900">Trusted access</p>
							<p className="mt-1 text-sm text-slate-600">
								Protected access to your tutoring workspace.
							</p>
						</div>
					</div>
				</section>

				<Card className="order-1 w-full border-white/70 bg-white/82 shadow-2xl shadow-blue-900/10 backdrop-blur lg:order-2">
					<CardContent className="p-8 sm:p-9">
						<div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
							Welcome back
						</div>
						<h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
							Sign In
						</h1>
						<p className="mt-2 mb-6 text-slate-600">
							Sign in with your saved account credentials.
						</p>

						<form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
									className="h-11 rounded-xl border-slate-200 bg-white"
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									name="password"
									placeholder="Enter your password"
									value={formData.password}
									onChange={handleChange}
									required
									className="h-11 rounded-xl border-slate-200 bg-white"
								/>
							</div>

							<Button type="submit" className="mt-2 h-11 w-full rounded-xl">
								Sign In
								<ArrowRight className="h-4 w-4" />
							</Button>
						</form>

						<p className="mt-6 text-center text-sm text-slate-600">
							Don&apos;t have an account?{" "}
							<Link
								to="/signup"
								className="font-bold text-blue-600 hover:underline">
								Create one
							</Link>
						</p>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}

export default SignIn;
