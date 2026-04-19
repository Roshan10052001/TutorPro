const Review = require("../models/Review");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Create a review for a completed session
// @route   POST /api/v1/reviews
// @access  Private (students only)
exports.createReview = asyncHandler(async (req, res, next) => {
	const { bookingId, rating, comment } = req.body;

	if (!bookingId || rating === undefined || rating === null) {
		return next(
			new ErrorResponse("bookingId and rating are required", 400),
		);
	}

	const booking = await Booking.findById(bookingId);

	if (!booking) {
		return next(new ErrorResponse("Booking not found", 404));
	}

	if (booking.student.toString() !== req.user._id.toString()) {
		return next(
			new ErrorResponse("You can only review your own sessions", 403),
		);
	}

	if (booking.status !== "completed") {
		return next(
			new ErrorResponse("You can only review completed sessions", 400),
		);
	}

	if (booking.tutor.toString() === req.user._id.toString()) {
		return next(new ErrorResponse("You cannot review yourself", 403));
	}

	try {
		const review = await Review.create({
			student: req.user._id,
			tutor: booking.tutor,
			booking: booking._id,
			rating,
			comment: comment || "",
		});

		return res.status(201).json({
			success: true,
			data: review,
		});
	} catch (err) {
		if (err && err.code === 11000) {
			return next(
				new ErrorResponse("You have already reviewed this session", 400),
			);
		}
		throw err;
	}
});

// @desc    Get all reviews for a tutor, with aggregate rating
// @route   GET /api/v1/reviews/tutor/:tutorId
// @access  Private (any authenticated user)
exports.getTutorReviews = asyncHandler(async (req, res, next) => {
	const reviews = await Review.find({ tutor: req.params.tutorId })
		.populate("student", "name")
		.sort({ createdAt: -1 });

	const count = reviews.length;
	const averageRating = count
		? reviews.reduce((sum, r) => sum + r.rating, 0) / count
		: 0;

	res.status(200).json({
		success: true,
		count,
		averageRating: Number(averageRating.toFixed(2)),
		data: reviews,
	});
});

// @desc    Get reviews authored by the logged-in student
// @route   GET /api/v1/reviews/me
// @access  Private (students only)
exports.getMyReviews = asyncHandler(async (req, res, next) => {
	const reviews = await Review.find({ student: req.user._id })
		.populate("tutor", "name")
		.sort({ createdAt: -1 });

	res.status(200).json({
		success: true,
		count: reviews.length,
		data: reviews,
	});
});

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (author or admin)
exports.deleteReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id);

	if (!review) {
		return next(new ErrorResponse("Review not found", 404));
	}

	const isAuthor = review.student.toString() === req.user._id.toString();
	const isAdmin = req.user.role === "admin";

	if (!isAuthor && !isAdmin) {
		return next(
			new ErrorResponse("Not authorized to delete this review", 403),
		);
	}

	await review.deleteOne();

	res.status(200).json({
		success: true,
		message: "Review deleted successfully",
	});
});
