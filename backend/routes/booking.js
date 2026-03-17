const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const Booking = require("../models/Booking");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Create a booking (student books a tutor)
// @route   POST /api/v1/bookings
// @access  Private (students only)
router.post(
	"/",
	protect,
	authorize("student"),
	asyncHandler(async (req, res, next) => {
		const { tutor, course, date, startTime, endTime, notes } = req.body;

		// Verify the tutor exists and is actually a tutor
		const tutorUser = await User.findById(tutor);

		if (!tutorUser || tutorUser.role !== "tutor") {
			return next(new ErrorResponse("Tutor not found", 404));
		}

		// Prevent booking in the past
		const bookingDate = new Date(date);
		if (bookingDate < new Date()) {
			return next(new ErrorResponse("Cannot book a session in the past", 400));
		}

		const booking = await Booking.create({
			student: req.user.id,
			tutor,
			course,
			date,
			startTime,
			endTime,
			notes,
		});

		res.status(201).json({
			success: true,
			data: booking,
		});
	}),
);

// @desc    Get all bookings for the logged-in user
// @route   GET /api/v1/bookings
// @access  Private
router.get(
	"/",
	protect,
	asyncHandler(async (req, res, next) => {
		let query;

		// Students see their own bookings, tutors see bookings assigned to them
		if (req.user.role === "student") {
			query = { student: req.user.id };
		} else if (req.user.role === "tutor") {
			query = { tutor: req.user.id };
		} else {
			// Admin sees all
			query = {};
		}

		// Optional status filter
		if (req.query.status) {
			query.status = req.query.status;
		}

		const bookings = await Booking.find(query)
			.populate("student", "name email")
			.populate("tutor", "name email")
			.populate("course", "code name")
			.sort({ date: 1, startTime: 1 });

		res.status(200).json({
			success: true,
			count: bookings.length,
			data: bookings,
		});
	}),
);

// @desc    Get a single booking by ID
// @route   GET /api/v1/bookings/:id
// @access  Private
router.get(
	"/:id",
	protect,
	asyncHandler(async (req, res, next) => {
		const booking = await Booking.findById(req.params.id)
			.populate("student", "name email")
			.populate("tutor", "name email")
			.populate("course", "code name");

		if (!booking) {
			return next(new ErrorResponse("Booking not found", 404));
		}

		// Only the student, tutor, or admin can view a booking
		const isOwner =
			booking.student._id.toString() === req.user.id ||
			booking.tutor._id.toString() === req.user.id;

		if (!isOwner && req.user.role !== "admin") {
			return next(
				new ErrorResponse("Not authorized to view this booking", 403),
			);
		}

		res.status(200).json({
			success: true,
			data: booking,
		});
	}),
);

// @desc    Update booking status (confirm / complete)
// @route   PATCH /api/v1/bookings/:id/status
// @access  Private (tutor or admin)
router.patch(
	"/:id/status",
	protect,
	authorize("tutor", "admin"),
	asyncHandler(async (req, res, next) => {
		const { status } = req.body;

		if (!status) {
			return next(new ErrorResponse("Please provide a status", 400));
		}

		const allowedStatuses = ["confirmed", "completed", "cancelled"];
		if (!allowedStatuses.includes(status)) {
			return next(
				new ErrorResponse(
					`Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
					400,
				),
			);
		}

		const booking = await Booking.findById(req.params.id);

		if (!booking) {
			return next(new ErrorResponse("Booking not found", 404));
		}

		// Tutors can only update their own bookings
		if (
			req.user.role === "tutor" &&
			booking.tutor.toString() !== req.user.id
		) {
			return next(
				new ErrorResponse("Not authorized to update this booking", 403),
			);
		}

		booking.status = status;
		await booking.save();

		res.status(200).json({
			success: true,
			data: booking,
		});
	}),
);

// @desc    Cancel a booking
// @route   PATCH /api/v1/bookings/:id/cancel
// @access  Private (student who created it, or admin)
router.patch(
	"/:id/cancel",
	protect,
	asyncHandler(async (req, res, next) => {
		const booking = await Booking.findById(req.params.id);

		if (!booking) {
			return next(new ErrorResponse("Booking not found", 404));
		}

		// Only the student who booked or an admin can cancel
		const isStudent = booking.student.toString() === req.user.id;

		if (!isStudent && req.user.role !== "admin") {
			return next(
				new ErrorResponse("Not authorized to cancel this booking", 403),
			);
		}

		if (booking.status === "cancelled") {
			return next(new ErrorResponse("Booking is already cancelled", 400));
		}

		if (booking.status === "completed") {
			return next(
				new ErrorResponse("Cannot cancel a completed booking", 400),
			);
		}

		booking.status = "cancelled";
		await booking.save();

		res.status(200).json({
			success: true,
			data: booking,
		});
	}),
);

module.exports = router;