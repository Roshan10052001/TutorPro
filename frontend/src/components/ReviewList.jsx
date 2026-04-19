import { useContext } from "react";
import StarRating from "./StarRating";
import { AuthContext } from "../context";
import { useDeleteReview } from "../hooks/review";

function ReviewList({ reviews = [] }) {
	const { user, role } = useContext(AuthContext);
	const { mutate: removeReview, isPending } = useDeleteReview();

	if (reviews.length === 0) {
		return <p className='muted-text'>No reviews yet.</p>;
	}

	const canDelete = (review) =>
		role === "admin" ||
		review.student?._id?.toString() === user?.id?.toString();

	return (
		<ul className='review-list'>
			{reviews.map((review) => (
				<li
					key={review._id}
					className='review-item dashboard-panel'>
					<div className='review-item-header'>
						<div>
							<strong>{review.student?.name || "Anonymous"}</strong>
							<div>
								<StarRating
									value={review.rating}
									readOnly
									size={16}
								/>
							</div>
						</div>
						<span className='muted-text'>
							{review.createdAt
								? new Date(review.createdAt).toLocaleDateString()
								: ""}
						</span>
					</div>
					{review.comment ? <p>{review.comment}</p> : null}
					{canDelete(review) ? (
						<button
							type='button'
							className='secondary-btn'
							disabled={isPending}
							onClick={() => removeReview(review._id)}>
							Delete
						</button>
					) : null}
				</li>
			))}
		</ul>
	);
}

export default ReviewList;
