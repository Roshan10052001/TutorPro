import { useEffect, useState } from "react";
import Modal from "./Modal";
import StarRating from "./StarRating";
import { useCreateReview } from "../hooks/review";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useConfirm } from "./ConfirmProvider";

function ReviewDialog({ isOpen, onClose, booking }) {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const { mutateAsync, isPending } = useCreateReview();
	const confirm = useConfirm();
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
		const ok = await confirm({
			title: "Submit Review",
			description: "This will submit your review for this tutor. Continue?",
			confirmText: "Yes, submit",
			variant: "default",
		});
		if (!ok) return;

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
				className='flex flex-col gap-4'
				onSubmit={handleSubmit}>
				<div className='flex flex-col gap-1.5'>
					<Label>Rating</Label>
					<StarRating
						value={rating}
						onChange={setRating}
						size={28}
					/>
				</div>

				<div className='flex flex-col gap-1.5'>
					<Label htmlFor='review-comment'>Comment (optional)</Label>
					<textarea
						id='review-comment'
						className='flex min-h-[96px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
						rows={4}
						maxLength={500}
						value={comment}
						onChange={(event) => setComment(event.target.value)}
						placeholder='Share what went well...'
					/>
					<p className='text-xs text-slate-500'>{comment.length}/500</p>
				</div>

				<div className='flex flex-wrap justify-end gap-2 pt-2'>
					<Button
						type='button'
						variant='outline'
						onClick={onClose}
						disabled={isPending}>
						Cancel
					</Button>
					<Button
						type='submit'
						disabled={isPending || rating < 1}>
						{isPending ? "Submitting..." : "Submit Review"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}

export default ReviewDialog;
