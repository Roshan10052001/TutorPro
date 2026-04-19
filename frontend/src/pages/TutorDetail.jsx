import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import StarRating from "../components/StarRating";
import ReviewList from "../components/ReviewList";
import { useGetTutorById } from "../hooks/tutor";
import { useGetTutorReviews } from "../hooks/review";

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
			<Layout
				page='Student'
				title='Tutor Details'>
				<p>Loading...</p>
			</Layout>
		);
	}

	if (!tutor) {
		return (
			<Layout
				page='Student'
				title='Tutor Details'>
				<p>Tutor not found.</p>
			</Layout>
		);
	}

	return (
		<Layout
			page='Student'
			title={tutor.name}
			subtitle={tutor.course}>
			<section className='dashboard-panel enhanced-panel'>
				<div className='tutor-card-header'>
					<div>
						<h3>{tutor.name}</h3>
						<p className='course-line'>{tutor.course}</p>
					</div>
					<div>
						<StarRating
							value={Math.round(reviewData.averageRating)}
							readOnly
						/>
						<p className='muted-text'>
							{reviewData.averageRating.toFixed(1)} · {reviewData.count} review
							{reviewData.count === 1 ? "" : "s"}
						</p>
					</div>
				</div>

				{tutor.bio ? <p>{tutor.bio}</p> : null}

				{Array.isArray(tutor.availability) && tutor.availability.length > 0 ? (
					<div className='slot-section'>
						<strong>Available Slots</strong>
						<ul className='slot-list'>
							{tutor.availability.map((slot, index) => (
								<li
									key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}>
									{formatAvailabilitySlot(slot)}
								</li>
							))}
						</ul>
					</div>
				) : null}

				<button
					className='primary-btn'
					onClick={() =>
						navigate("/student/sessions", {
							state: { openBooking: true, tutorId: tutor._id },
						})
					}>
					Book a Session
				</button>
			</section>

			<section className='dashboard-panel enhanced-panel'>
				<h2>Reviews</h2>
				{isReviewsLoading ? (
					<p>Loading reviews...</p>
				) : (
					<ReviewList reviews={reviewData.reviews} />
				)}
			</section>
		</Layout>
	);
}

export default TutorDetail;
