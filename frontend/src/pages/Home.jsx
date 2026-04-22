import { Link } from "react-router-dom";
import { useContext } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  Users,
  Sparkles,
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/70 text-slate-900">
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-80px] top-16 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute right-[-100px] top-32 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-100/40 blur-3xl" />
        </div>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Smarter peer tutoring for campus success
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Find the right tutor, book faster, and learn with more confidence.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Tutor Pro helps students connect with approved tutors, schedule
              real available time slots, and manage sessions in one clean and
              simple platform. Tutors can apply, share availability, and support
              students more effectively, while admins keep the system organized
              and trusted.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="rounded-xl px-6">
                    <Link to={dashboardPath}>
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  {effectiveRole === "student" && (
                    <Button asChild size="lg" variant="outline" className="rounded-xl px-6">
                      <Link to="/student/tutors">Browse Tutors</Link>
                    </Button>
                  )}

                  {user?.role === "tutor" && (
                    <Button asChild size="lg" variant="outline" className="rounded-xl px-6">
                      <Link to="/tutor/tutor-apply">My Applications</Link>
                    </Button>
                  )}

                  {user?.role === "admin" && (
                    <Button asChild size="lg" variant="outline" className="rounded-xl px-6">
                      <Link to="/admin/tutor-applications">Review Requests</Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="rounded-xl px-6">
                    <Link to="/signup">
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl px-6">
                    <Link to="/signin">Sign In</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200/60 backdrop-blur">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  Approved tutors only
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200/60 backdrop-blur">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  Real-time slot booking
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200/60 backdrop-blur">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  Role-based dashboards
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/20">
              <CardContent className="p-8 sm:p-10">
                <div className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
                  Why Tutor Pro feels better
                </div>

                <h3 className="mt-5 text-2xl font-extrabold sm:text-3xl">
                  Built for a smoother and more trusted tutoring experience
                </h3>

                <p className="mt-4 leading-7 text-blue-50">
                  Students only see approved tutors. Tutors manage actual
                  availability. Admins review tutor applications before they go
                  live. That makes the booking experience cleaner, safer, and
                  much more practical for a university platform.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-sm text-blue-100">Tutor visibility</p>
                    <p className="mt-1 text-xl font-bold">Admin-approved only</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-sm text-blue-100">Booking flow</p>
                    <p className="mt-1 text-xl font-bold">Based on real slots</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-sm text-blue-100">Student experience</p>
                    <p className="mt-1 text-xl font-bold">Simple and guided</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-sm text-blue-100">Platform control</p>
                    <p className="mt-1 text-xl font-bold">Clear admin review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          <div className="grid gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur md:grid-cols-3">
            <div>
              <p className="text-3xl font-extrabold text-slate-900">Easy</p>
              <p className="mt-1 text-sm text-slate-600">
                Clean session booking flow for students
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">Trusted</p>
              <p className="mt-1 text-sm text-slate-600">
                Tutor approval before public visibility
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">Organized</p>
              <p className="mt-1 text-sm text-slate-600">
                Separate dashboards for each role
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Everything needed for a better tutoring workflow
            </h2>
            <p className="mt-3 text-slate-600">
              Tutor Pro is designed to make the tutoring process simple for
              students, manageable for tutors, and reliable for admins.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="rounded-2xl border-slate-200/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Approved Tutor Flow
                </h3>
                <p className="mt-2 text-slate-600">
                  Tutors apply first, admins review them, and only approved
                  tutors appear to students. This keeps the platform more
                  trustworthy and professional.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-indigo-100 p-3 text-indigo-600">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Slot-Based Booking
                </h3>
                <p className="mt-2 text-slate-600">
                  Students choose from the tutor’s real availability, making the
                  booking process much more practical, clear, and organized.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-sky-100 p-3 text-sky-600">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Better Role Management
                </h3>
                <p className="mt-2 text-slate-600">
                  Students, tutors, and admins each get their own workflow and
                  dashboard, which makes the platform easier to use for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900">
                How Tutor Pro works
              </h2>
              <p className="mt-3 text-slate-600">
                A simple process that keeps tutoring accessible, structured, and
                easy to manage.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Students explore tutors
                </h3>
                <p className="mt-2 text-slate-600">
                  Students browse approved tutors and choose the right academic
                  support based on need.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Tutors manage availability
                </h3>
                <p className="mt-2 text-slate-600">
                  Tutors share real time slots so booking is based on actual
                  availability.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Admins keep quality high
                </h3>
                <p className="mt-2 text-slate-600">
                  Admin review helps maintain trust, structure, and a better user
                  experience across the system.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;