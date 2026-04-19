import { useEffect, useState } from "react";
import Modal from "./Modal";
import StarRating from "./StarRating";
import { useCreateReview } from "../hooks/review";

function ReviewDialog({ isOpen, onClose, booking }) {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const { mutateAsync, isPending } = useCreateReview();

	useEffect(() => {
		if (isOpen) {
			setRating(0);
			setComment("");
		}
	}, [isOpen]);

	const tutorName = booking?.tutor?.name || "this tutor";

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!booking?._id || rating < 1) return;

		try {
			await mutateAsync({
				bookingId: booking._id,
				rating,
				comment: comment.trim(),
			});
			onClose();
		} catch {
			// errorAlert handled in hook
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Review ${tutorName}`}
			size='md'>
			<form
				className='review-form'
				onSubmit={handleSubmit}>
				<div className='form-group'>
					<label>Rating</label>
					<StarRating
						value={rating}
						onChange={setRating}
						size={28}
					/>
				</div>

				<div className='form-group'>
					<label htmlFor='review-comment'>Comment (optional)</label>
					<textarea
						id='review-comment'
						className='form-control'
						rows={4}
						maxLength={500}
						value={comment}
						onChange={(event) => setComment(event.target.value)}
						placeholder='Share what went well...'
					/>
					<small className='muted-text'>{comment.length}/500</small>
				</div>

				<div className='form-actions'>
					<button
						type='button'
						className='secondary-btn'
						onClick={onClose}
						disabled={isPending}>
						Cancel
					</button>
					<button
						type='submit'
						className='primary-btn'
						disabled={isPending || rating < 1}>
						{isPending ? "Submitting..." : "Submit Review"}
					</button>
				</div>
			</form>
		</Modal>
	);
}

export default ReviewDialog;
