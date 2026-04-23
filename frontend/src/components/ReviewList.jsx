import { useContext } from "react";
import StarRating from "./StarRating";
import { AuthContext } from "../context";
import { useDeleteReview } from "../hooks/review";
import { Button } from "@/components/ui/button";
import { useConfirm } from "./ConfirmProvider";

function ReviewList({ reviews = [] }) {
	const { user, role } = useContext(AuthContext);
	const { mutate: removeReview, isPending } = useDeleteReview();
	const confirm = useConfirm();
	if (reviews.length === 0) {
		return <p className='text-sm text-slate-500'>No reviews yet.</p>;
	}

	const canDelete = (review) =>
		role === "admin" ||
		review.student?._id?.toString() === user?.id?.toString();

	const handleRemoveReview = async (reviewId) => {
		if (!reviewId) return;
		const ok = await confirm({
			title: "Delete Review",
			description: "This will delete your review. Continue?",
			confirmText: "Yes, delete",
			variant: "destructive",
		});
		if (!ok) return;
		removeReview(reviewId);
	};
	return (
		<ul className='flex flex-col gap-4'>
			{reviews.map((review) => (
				<li
					key={review._id}
					className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
					<div className='flex items-start justify-between gap-3'>
						<div>
							<strong className='text-sm font-semibold text-slate-900'>
								{review.student?.name || "Anonymous"}
							</strong>
							<div className='mt-1'>
								<StarRating
									value={review.rating}
									readOnly
									size={16}
								/>
							</div>
						</div>
						<span className='text-xs text-slate-500'>
							{review.createdAt
								? new Date(review.createdAt).toLocaleDateString()
								: ""}
						</span>
					</div>
					{review.comment ? (
						<p className='mt-2 text-sm text-slate-700'>{review.comment}</p>
					) : null}
					{canDelete(review) ? (
						<Button
							type='button'
							variant='outline'
							size='sm'
							className='mt-3 border-rose-300 text-rose-600 hover:bg-rose-50'
							disabled={isPending}
							onClick={() => handleRemoveReview(review._id)}>
							Delete
						</Button>
					) : null}
				</li>
			))}
		</ul>
	);
}

export default ReviewList;
