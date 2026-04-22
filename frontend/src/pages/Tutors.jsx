import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import EmptyState from "../components/EmptyState";
import { useGetTutors } from "../hooks/tutor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function Tutors() {
	const [search, setSearch] = useState("");
	const navigate = useNavigate();
	const { data: tutors = [] } = useGetTutors();

	const formatAvailabilitySlot = (slot) => {
		if (!slot || typeof slot !== "object") return String(slot || "-");
		return `${slot.day}: ${slot.startTime} - ${slot.endTime} • ${slot.sessionLengthMinutes} min sessions`;
	};

	const approvedTutors = tutors.filter((tutor) => tutor.status === "approved");

	const filteredTutors = useMemo(() => {
		return approvedTutors.filter(
			(tutor) =>
				tutor.name.toLowerCase().includes(search.toLowerCase()) ||
				tutor.course.toLowerCase().includes(search.toLowerCase())
		);
	}, [approvedTutors, search]);

	return (
		<Layout
			page="Student"
			title="Find Tutors"
			subtitle="Browse only admin-approved tutors and their available time slots.">
			<Card className="mb-6">
				<CardContent className="p-4">
					<Input
						type="text"
						placeholder="Search by tutor name or course"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</CardContent>
			</Card>

			{filteredTutors.length === 0 ? (
				<EmptyState
					title="No tutors found"
					text="Try another search or wait for admin-approved tutors."
				/>
			) : (
				<section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{filteredTutors.map((tutor) => (
						<Card key={tutor._id} className="flex flex-col">
							<CardContent className="flex flex-1 flex-col gap-3 p-6">
								<div className="flex items-start justify-between gap-3">
									<div>
										<h3 className="text-lg font-bold text-slate-900">
											{tutor.name}
										</h3>
										<p className="text-sm font-semibold text-blue-600">
											{tutor.course}
										</p>
									</div>
									<Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
										★ {tutor.rating}
									</Badge>
								</div>

								<p className="text-sm text-slate-600">{tutor.bio}</p>

								<Button
									variant="outline"
									size="sm"
									onClick={() => navigate(`/student/tutors/${tutor._id}`)}>
									View details & reviews
								</Button>

								<div className="mt-2">
									<strong className="text-sm font-semibold text-slate-900">
										Available Slots
									</strong>
									{tutor.availability.length === 0 ? (
										<p className="mt-1 text-sm text-slate-500">
											No slots open right now.
										</p>
									) : (
										<ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
											{tutor.availability.map((slot, index) => (
												<li
													key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}>
													{formatAvailabilitySlot(slot)}
												</li>
											))}
										</ul>
									)}
								</div>

								<Button
									className="mt-auto"
									onClick={() =>
										navigate("/student/sessions", {
											state: {
												openBooking: true,
												tutorId: tutor._id,
											},
										})
									}
									disabled={tutor.availability.length === 0}>
									{tutor.availability.length === 0
										? "No Slots Available"
										: "Book Now"}
								</Button>
							</CardContent>
						</Card>
					))}
				</section>
			)}
		</Layout>
	);
}

export default Tutors;
