import { Link } from "react-router-dom";
import { useContext } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context";
import { getDashboardPath } from "../routes/path";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function Home() {
	const { user, activeView, effectiveRole, isAuthenticated } =
		useContext(AuthContext);
	const dashboardPath = getDashboardPath(user?.role, activeView);

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/60">
			<Navbar />

			<main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
				<section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
					<div>
						<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
							Smart peer tutoring for a better campus learning experience.
						</h1>
						<p className="mt-5 text-lg leading-relaxed text-slate-600">
							Tutor Pro helps students connect with approved tutors, book real
							time slots, and manage sessions in one clean platform. Tutors can
							apply, share their availability, and support students with a more
							organized flow. Admins can review applications and keep the whole
							system running smoothly.
						</p>

						<div className="mt-7 flex flex-wrap gap-3">
							{isAuthenticated ? (
								<>
									<Button asChild size="lg">
										<Link to={dashboardPath}>Go to Dashboard</Link>
									</Button>
									{effectiveRole === "student" && (
										<Button asChild size="lg" variant="outline">
											<Link to="/student/tutors">Browse Tutors</Link>
										</Button>
									)}
									{user?.role === "tutor" && (
										<Button asChild size="lg" variant="outline">
											<Link to="/tutor/tutor-apply">My Applications</Link>
										</Button>
									)}
									{user?.role === "admin" && (
										<Button asChild size="lg" variant="outline">
											<Link to="/admin/tutor-applications">Review Requests</Link>
										</Button>
									)}
								</>
							) : (
								<>
									<Button asChild size="lg">
										<Link to="/signup">Create Account</Link>
									</Button>
									<Button asChild size="lg" variant="outline">
										<Link to="/signin">Sign In</Link>
									</Button>
								</>
							)}
						</div>
					</div>

					<Card className="bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/25">
						<CardContent className="p-8">
							<h3 className="text-2xl font-extrabold">
								Why Tutor Pro works better
							</h3>
							<p className="mt-3 leading-relaxed text-blue-50">
								Students only see approved tutors. Tutors manage their real
								available slots. Admins control approvals before any tutor
								becomes visible in the system. This makes booking cleaner,
								safer, and more realistic for a university tutoring platform.
							</p>
						</CardContent>
					</Card>
				</section>

				<section className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					<Card>
						<CardContent className="p-6">
							<h3 className="text-lg font-bold text-slate-900">
								Approved Tutor Flow
							</h3>
							<p className="mt-2 text-slate-600">
								Tutors first apply, then admin reviews and approves. Only after
								approval do they appear for students.
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<h3 className="text-lg font-bold text-slate-900">
								Slot Based Booking
							</h3>
							<p className="mt-2 text-slate-600">
								Students can choose from the tutor's actual available timing, so
								the booking process feels direct and organized.
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<h3 className="text-lg font-bold text-slate-900">
								Better Role Management
							</h3>
							<p className="mt-2 text-slate-600">
								Students, tutors, and admins each get their own dashboard flow,
								making the platform easy to understand and use.
							</p>
						</CardContent>
					</Card>
				</section>
			</main>
		</div>
	);
}

export default Home;
