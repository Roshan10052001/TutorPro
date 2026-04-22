import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import StarRating from "../components/StarRating";
import ReviewList from "../components/ReviewList";
import Loader from "../components/Loader";
import { useGetTutorById } from "../hooks/tutor";
import { useGetTutorReviews } from "../hooks/review";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function TutorDetail() {
	const { tutorId } = useParams();
	const navigate = useNavigate();
	const { data: tutor, isPending: isTutorLoading } = useGetTutorById(tutorId);
	const {
		data: reviewData = { reviews: [], count: 0, averageRating: 0 },
		isPending: isReviewsLoading,
	} = useGetTutorReviews(tutorId);

	const formatAvailabilitySlot = (slot) => {
		if (!slot || typeof slot !== "object") return String(slot || "-");
		return `${slot.day}: ${slot.startTime} - ${slot.endTime} • ${slot.sessionLengthMinutes} min sessions`;
	};

	if (isTutorLoading) {
		return (
			<Layout page="Student" title="Tutor Details">
				<Loader />
			</Layout>
		);
	}

	if (!tutor) {
		return (
			<Layout page="Student" title="Tutor Details">
				<p className="text-slate-600">Tutor not found.</p>
			</Layout>
		);
	}

	return (
		<Layout
			page="Student"
			title={tutor.name}
			subtitle={tutor.course}>
			<Card className="mb-6">
				<CardContent className="p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h3 className="text-xl font-bold text-slate-900">{tutor.name}</h3>
							<p className="text-sm font-semibold text-blue-600">{tutor.course}</p>
						</div>
						<div className="flex flex-col items-start gap-1">
							<StarRating value={Math.round(reviewData.averageRating)} readOnly />
							<p className="text-sm text-slate-500">
								{reviewData.averageRating.toFixed(1)} · {reviewData.count} review
								{reviewData.count === 1 ? "" : "s"}
							</p>
						</div>
					</div>

					{tutor.bio ? (
						<p className="mt-4 text-sm text-slate-700">{tutor.bio}</p>
					) : null}

					{Array.isArray(tutor.availability) && tutor.availability.length > 0 ? (
						<div className="mt-4">
							<strong className="text-sm font-semibold text-slate-900">
								Available Slots
							</strong>
							<ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
								{tutor.availability.map((slot, index) => (
									<li key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}>
										{formatAvailabilitySlot(slot)}
									</li>
								))}
							</ul>
						</div>
					) : null}

					<Button
						className="mt-5"
						onClick={() =>
							navigate("/student/sessions", {
								state: { openBooking: true, tutorId: tutor._id },
							})
						}>
						Book a Session
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-6">
					<h2 className="mb-4 text-lg font-bold text-slate-900">Reviews</h2>
					{isReviewsLoading ? (
						<Loader />
					) : (
						<ReviewList reviews={reviewData.reviews} />
					)}
				</CardContent>
			</Card>
		</Layout>
	);
}

export default TutorDetail;
