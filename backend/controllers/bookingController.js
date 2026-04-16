const Booking = require("../models/Booking");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

function getBookingAccess(booking, user, populated = false) {
	const studentId = populated
		? booking.student._id.toString()
		: booking.student.toString();
	const tutorId = populated
		? booking.tutor._id.toString()
		: booking.tutor.toString();
	const userId = user._id.toString();

	return {
		isAdmin: user.role === "admin",
		isStudent: studentId === userId,
		isTutor: tutorId === userId,
	};
}

// @desc    Create a new booking
// @route   POST /api/v1/bookings
// @access  Private (students only)
exports.createBooking = asyncHandler(async (req, res, next) => {
	const { tutor, course, date, startTime, endTime, notes } = req.body;

	if (!tutor || !course || !date || !startTime || !endTime) {
		return next(new ErrorResponse("Please provide all required fields", 400));
	}

	const tutorUser = await User.findById(tutor);

	if (!tutorUser) {
		return next(new ErrorResponse("Tutor not found", 404));
	}

	if (tutorUser.role !== "tutor") {
		return next(
			new ErrorResponse("Selected user is not an approved tutor", 403),
		);
	}

	const existingBooking = await Booking.findOne({
		tutor,
		date,
		startTime,
	});

	if (existingBooking) {
		return next(
			new ErrorResponse(
				"This tutor already has a booking for that time slot",
				400,
			),
		);
	}

	// Prevent booking in the past
	const bookingDate = new Date(date);
	bookingDate.setHours(parseInt(startTime.split(":")[0]));
	bookingDate.setMinutes(parseInt(startTime.split(":")[1]));
	bookingDate.setSeconds(0);
	bookingDate.setMilliseconds(0);

	if (bookingDate < new Date()) {
		return next(new ErrorResponse("Cannot book a session in the past", 400));
	}

	const booking = await Booking.create({
		student: req.user._id,
		tutor,
		course,
		date,
		startTime,
		endTime,
		notes: notes || "",
	});

	res.status(201).json({
		success: true,
		data: booking,
	});
});

// @desc    Get bookings for current user
// @route   GET /api/v1/bookings
// @access  Private (students see their bookings, tutors see bookings where they are the tutor)
exports.getBookings = asyncHandler(async (req, res, next) => {
	let query = {};

	if (req.user.role === "student") {
		query.student = req.user._id;
	} else if (req.user.role === "tutor") {
		query.tutor = req.user._id;
	}

	const bookings = await Booking.find(query)
		.populate("student", "name email")
		.populate("tutor", "name email")
		.sort({ createdAt: -1 });

	res.status(200).json({
		success: true,
		count: bookings.length,
		data: bookings,
	});
});

// @desc    Get a single booking by ID
// @route   GET /api/v1/bookings/:id
// @access  Private (only student or tutor involved in the booking can access)
exports.getBookingById = asyncHandler(async (req, res, next) => {
	const booking = await Booking.findById(req.params.id)
		.populate("student", "name email")
		.populate("tutor", "name email");

	if (!booking) {
		return next(new ErrorResponse("Booking not found", 404));
	}

	const { isAdmin, isStudent, isTutor } = getBookingAccess(
		booking,
		req.user,
		true,
	);

	if (!isAdmin && !isStudent && !isTutor) {
		return next(new ErrorResponse("Not authorized to view this booking", 403));
	}

	res.status(200).json({
		success: true,
		data: booking,
	});
});

// @desc    Delete a booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private (only student or tutor involved in the booking can delete)
exports.deleteBooking = asyncHandler(async (req, res, next) => {
	const booking = await Booking.findById(req.params.id);

	if (!booking) {
		return next(new ErrorResponse("Booking not found", 404));
	}

	const { isAdmin, isStudent, isTutor } = getBookingAccess(booking, req.user);

	if (!isAdmin && !isStudent && !isTutor) {
		return next(
			new ErrorResponse("Not authorized to delete this booking", 403),
		);
	}

	await booking.deleteOne();

	res.status(200).json({
		success: true,
		message: "Booking deleted successfully",
	});
});

// @desc    Update a booking (e.g. reschedule)
// @route   PUT /api/v1/bookings/:id
// @access  Private (only student or tutor involved in the booking can update)
exports.updateBooking = asyncHandler(async (req, res, next) => {
	const { date, startTime, endTime, notes } = req.body;
	const booking = await Booking.findById(req.params.id);

	if (!booking) {
		return next(new ErrorResponse("Booking not found", 404));
	}

	const { isAdmin, isStudent, isTutor } = getBookingAccess(booking, req.user);

	if (!isAdmin && !isStudent && !isTutor) {
		return next(
			new ErrorResponse("Not authorized to update this booking", 403),
		);
	}

	// Check for conflicting bookings if date or time is being updated
	if (date || startTime) {
		const existingBooking = await Booking.findOne({
			tutor: booking.tutor,
			date: date || booking.date,
			startTime: startTime || booking.startTime,
			_id: { $ne: booking._id }, // Exclude current booking from conflict check
		});

		if (existingBooking) {
			return next(
				new ErrorResponse(
					"This tutor already has a booking for that time slot",
					400,
				),
			);
		}
	}

	booking.date = date || booking.date;
	booking.startTime = startTime || booking.startTime;
	booking.endTime = endTime || booking.endTime;
	booking.notes = notes !== undefined ? notes : booking.notes;

	await booking.save();

	res.status(200).json({
		success: true,
		data: booking,
	});
});

// @desc    Update booking status (e.g. mark as completed) - this could be used by tutors to mark a session as completed
// @route   PUT /api/v1/bookings/:id/status
// @access  Private (only tutor involved in the booking can update status)
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
	const { status } = req.body;

	const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
	if (!allowedStatuses.includes(status)) {
		return next(new ErrorResponse("Invalid booking status", 400));
	}

	const booking = await Booking.findById(req.params.id);

	if (!booking) {
		return next(new ErrorResponse("Booking not found", 404));
	}

	const { isAdmin, isTutor } = getBookingAccess(booking, req.user);

	if (!isAdmin && !isTutor) {
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
});

//@desc Cancel a booking (student or tutor can cancel)
// @route   POST /api/v1/bookings/:id/cancel
// @access  Private (only student or tutor involved in the booking can cancel)
exports.cancelBooking = asyncHandler(async (req, res, next) => {
	const booking = await Booking.findById(req.params.id);

	if (!booking) {
		return next(new ErrorResponse("Booking not found", 404));
	}

	const { isAdmin, isStudent, isTutor } = getBookingAccess(booking, req.user);

	if (!isAdmin && !isStudent && !isTutor) {
		return next(
			new ErrorResponse("Not authorized to cancel this booking", 403),
		);
	}

	if (booking.status === "completed") {
		return next(
			new ErrorResponse("Completed bookings cannot be cancelled", 400),
		);
	}

	if (booking.status === "cancelled") {
		return next(new ErrorResponse("Booking is already cancelled", 400));
	}

	booking.status = "cancelled";
	await booking.save();

	res.status(200).json({
		success: true,
		data: booking,
	});
});
