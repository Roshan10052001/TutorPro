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

const convertTimeToMinutes = (timeString) => {
	if (!timeString) return 0;
	const [time, modifier] = timeString.split(" ");
	let [hours, minutes] = time.split(":").map(Number);

	if (modifier === "PM" && hours !== 12) hours += 12;
	if (modifier === "AM" && hours === 12) hours = 0;

	return hours * 60 + minutes;
};

function normalizeDateOnly(value) {
	const date = new Date(value);
	date.setHours(0, 0, 0, 0);
	return date;
}

function buildDateTime(dateValue, timeString) {
	const date = normalizeDateOnly(dateValue);

	const [time, modifier] = timeString.trim().split(" ");
	let [hours, minutes] = time.split(":").map(Number);

	if (modifier === "PM" && hours !== 12) {
		hours += 12;
	}

	if (modifier === "AM" && hours === 12) {
		hours = 0;
	}

	date.setHours(hours, minutes, 0, 0);
	return date;
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

	const bookingDate = normalizeDateOnly(date);
	const newStart = convertTimeToMinutes(startTime);
	const newEnd = convertTimeToMinutes(endTime);

	if (newEnd <= newStart) {
		return next(new ErrorResponse("End time must be after start time", 400));
	}

	const bookingDateTime = buildDateTime(bookingDate, startTime);

	if (bookingDateTime < new Date()) {
		return next(new ErrorResponse("Cannot book a session in the past", 400));
	}

	const existingBookings = await Booking.find({
		tutor,
		date: bookingDate,
		status: { $ne: "cancelled" },
	});

	const hasConflict = existingBookings.some((booking) => {
		const existingStart = convertTimeToMinutes(booking.startTime);
		const existingEnd = convertTimeToMinutes(booking.endTime);

		return existingStart < newEnd && existingEnd > newStart;
	});

	if (hasConflict) {
		return next(
			new ErrorResponse(
				"This tutor already has a booking that overlaps this time",
				400,
			),
		);
	}

	const booking = await Booking.create({
		student: req.user._id,
		tutor,
		course,
		date: bookingDate,
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
	//Admin can see all bookings, students see their bookings, tutors see bookings where they are the tutor
	let query = {};
	const requestedView = req.query.view;

	if (req.user.role === "student") {
		query.student = req.user._id;
	} else if (req.user.role === "tutor") {
		query[requestedView === "student" ? "student" : "tutor"] = req.user._id;
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

	const updatedDate = date
		? normalizeDateOnly(date)
		: normalizeDateOnly(booking.date);
	const updatedStartTime = startTime || booking.startTime;
	const updatedEndTime = endTime || booking.endTime;

	const updatedStart = convertTimeToMinutes(updatedStartTime);
	const updatedEnd = convertTimeToMinutes(updatedEndTime);

	if (updatedEnd <= updatedStart) {
		return next(new ErrorResponse("End time must be after start time", 400));
	}

	const updatedDateTime = buildDateTime(updatedDate, updatedStartTime);

	if (updatedDateTime < new Date()) {
		return next(
			new ErrorResponse("Cannot schedule a session in the past", 400),
		);
	}

	const existingBookings = await Booking.find({
		tutor: booking.tutor,
		date: updatedDate,
		_id: { $ne: booking._id },
		status: { $ne: "cancelled" },
	});

	const hasConflict = existingBookings.some((existingBooking) => {
		const existingStart = convertTimeToMinutes(existingBooking.startTime);
		const existingEnd = convertTimeToMinutes(existingBooking.endTime);

		return existingStart < updatedEnd && existingEnd > updatedStart;
	});

	if (hasConflict) {
		return next(
			new ErrorResponse(
				"This tutor already has a booking that overlaps this time slot",
				400,
			),
		);
	}

	booking.date = updatedDate;
	booking.startTime = updatedStartTime;
	booking.endTime = updatedEndTime;
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
