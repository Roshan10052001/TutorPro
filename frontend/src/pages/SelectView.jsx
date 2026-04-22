import { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context";
import { getDashboardPath } from "../routes/path";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function SelectView() {
	const navigate = useNavigate();
	const { user, activeView, switchView } = useContext(AuthContext);

	if (!user) {
		return <Navigate to="/signin" replace />;
	}

	if (user.role === "student" || user.role === "admin") {
		return <Navigate to={getDashboardPath(user.role, activeView)} replace />;
	}

	const handleContinue = (nextView) => {
		switchView(nextView);
		navigate(getDashboardPath(user.role, nextView), { replace: true });
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/60">
			<Navbar />
			<main className="flex items-center justify-center px-4 py-10 sm:py-16">
				<Card className="w-full max-w-md shadow-xl">
					<CardContent className="p-8">
						<h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
							Choose Your View
						</h1>
						<p className="mt-2 mb-6 text-slate-600">
							Select how you want to continue in Tutor Pro today.
						</p>

						<div className="grid gap-3 sm:grid-cols-2">
							<Button onClick={() => handleContinue("tutor")}>
								Continue as Tutor
							</Button>
							<Button
								variant="outline"
								onClick={() => handleContinue("student")}>
								Continue as Student
							</Button>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}

export default SelectView;
