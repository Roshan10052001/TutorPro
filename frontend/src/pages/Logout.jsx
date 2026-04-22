import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context";
import { useConfirm } from "../components/ConfirmProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function Logout() {
	const { logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const confirm = useConfirm();

	useEffect(() => {
		let isMounted = true;

		const confirmLogout = async () => {
			const ok = await confirm({
				title: "Confirmation",
				description: "Are you sure you want to log out?",
			});

			if (!isMounted) return;

			if (ok) {
				logout();
				return;
			}

			navigate(-1);
		};

		confirmLogout();

		return () => {
			isMounted = false;
		};
	}, [confirm, logout, navigate]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/60">
			<Navbar />
			<main className="flex items-center justify-center px-4 py-10 sm:py-16">
				<Card className="w-full max-w-md shadow-xl">
					<CardContent className="p-8 text-center">
						<h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
							You have been signed out
						</h1>
						<p className="mt-2 mb-6 text-slate-600">
							Thank you for using Tutor Pro.
						</p>
						<Button asChild>
							<Link to="/signin">Sign In Again</Link>
						</Button>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}

export default Logout;
