const mongoose = require("mongoose");
const TutorApplication = require("../models/TutorApplication");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

const DAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

function convertTimeToMinutes(timeString) {
	if (!timeString) return 0;

	const [time, modifier] = timeString.split(" ");
	let [hours, minutes] = time.split(":").map(Number);

	if (modifier === "PM" && hours !== 12) hours += 12;
	if (modifier === "AM" && hours === 12) hours = 0;

	return hours * 60 + minutes;
}

function getNextDateForDay(dayName, startTime = "") {
	const today = new Date();
	const todayDay = today.getDay();
	const targetDay = DAYS.indexOf(dayName);
	let diff = targetDay - todayDay;

	// Wrap into the next upcoming week if the target day already passed.
	if (diff < 0) diff += 7;

	// When the availability day is today, use next week if that slot's start
	// time is already behind the current time. This keeps booked-slot matching
	// aligned with the booking form's "next valid occurrence" behavior.
	if (diff === 0 && startTime) {
		const selectedMinutes = convertTimeToMinutes(startTime);
		const currentMinutes = today.getHours() * 60 + today.getMinutes();

		if (selectedMinutes <= currentMinutes) {
			diff = 7;
		}
	}

	const result = new Date(today);
	result.setDate(today.getDate() + diff);
	// Normalize to midnight so date comparisons stay consistent.
	result.setHours(0, 0, 0, 0);
	return result;
}

function getDateKey(dateValue) {
	const date = new Date(dateValue);
	// Build a stable YYYY-MM-DD key so we can dedupe requested booking dates.
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

async function getBookingsByTutor(applications) {
	const tutorUserIds = applications
		.map((application) => application.user?.toString())
		.filter(Boolean);

	if (tutorUserIds.length === 0) {
		return new Map();
	}

	// Convert each recurring availability day into the next real calendar date
	// that the booking system would use for session creation on the frontend.
	const requestedDateKeys = [
		...new Set(
			applications.flatMap((application) =>
				(application.availability || []).map((slot) =>
					getDateKey(getNextDateForDay(slot.day, slot.startTime)),
				),
			),
		),
	];

	// Pull active bookings for these tutors on the requested dates so the UI
	// can gray out already-taken generated time slots.
	const bookings = await Booking.find({
		tutor: { $in: tutorUserIds },
		status: { $ne: "cancelled" },
	}).select("tutor date startTime endTime");

	const bookingsByTutorUser = bookings.reduce((map, booking) => {
		const bookingDateKey = getDateKey(booking.date);

		if (!requestedDateKeys.includes(bookingDateKey)) {
			return map;
		}

		const tutorId = booking.tutor.toString();
		const day = DAYS[new Date(booking.date).getDay()];
		const existing = map.get(tutorId) || [];

		existing.push({
			day,
			startTime: booking.startTime,
			endTime: booking.endTime,
			label: `${day} - ${booking.startTime} to ${booking.endTime}`,
		});

		map.set(tutorId, existing);
		return map;
	}, new Map());

	return applications.reduce((map, application) => {
		const tutorId = application.user?.toString();

		map.set(application._id.toString(), bookingsByTutorUser.get(tutorId) || []);
		return map;
	}, new Map());
}

async function getReviewsByTutorUser(applications) {
	const tutorUserIds = applications
		.map((application) => application.user?.toString())
		.filter(Boolean);

	if (tutorUserIds.length === 0) {
		return new Map();
	}

	const aggregates = await Review.aggregate([
		{ $match: { tutor: { $in: tutorUserIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
		{
			$group: {
				_id: "$tutor",
				avg: { $avg: "$rating" },
				count: { $sum: 1 },
			},
		},
	]);

	return aggregates.reduce((map, row) => {
		map.set(row._id.toString(), { avg: row.avg, count: row.count });
		return map;
	}, new Map());
}

function formatTutorData(app, bookingsByTutor, reviewsByTutorUser) {
	const tutorUserId = app.user?.toString?.() || app.user;
	const reviewStats = reviewsByTutorUser?.get(tutorUserId);

	return {
		_id: app._id,
		// Send the real user id too, since bookings are created against the tutor user.
		userId: tutorUserId,
		name: app.name,
		email: app.email,
		course: app.course,
		bio: app.bio,
		availability: app.availability || [],
		// The frontend compares generated slots against these booked ones.
		bookedSlots: bookingsByTutor.get(app._id.toString()) || [],
		status: app.status,
		rating: reviewStats?.avg ?? 0,
		reviewCount: reviewStats?.count ?? 0,
	};
}

// @desc    Get all tutors
// @route   GET /api/tutors
// @access  Private
exports.getTutors = asyncHandler(async (req, res, next) => {
	const { name, course, page = 1, limit = 10 } = req.query;

	// Only show approved tutor applications
	const query = { status: "approved" };

	// Filter by tutor name (stored in application)
	if (name) {
		query.name = { $regex: name, $options: "i" };
	}
	// Filter by course
	if (course) {
		query.course = course;
	}

	const pageNumber = parseInt(page, 10);
	const limitNumber = parseInt(limit, 10);
	const skip = (pageNumber - 1) * limitNumber;

	// Get tutors + total count at same time
	const [applications, total] = await Promise.all([
		TutorApplication.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limitNumber),

		TutorApplication.countDocuments(query),
	]);

	const [bookingsByTutor, reviewsByTutorUser] = await Promise.all([
		getBookingsByTutor(applications),
		getReviewsByTutorUser(applications),
	]);

	// Format data for frontend
	const tutors = applications.map((app) =>
		formatTutorData(app, bookingsByTutor, reviewsByTutorUser),
	);

	res.status(200).json({
		success: true,
		count: tutors.length,
		total,
		page: pageNumber,
		pages: Math.ceil(total / limitNumber),
		data: tutors,
	});
});

// @desc    Get single tutor by ID
// @route   GET /api/tutors/:id
// @access  Private
exports.getTutorById = asyncHandler(async (req, res, next) => {
	const tutor = await TutorApplication.findById(req.params.id);

	if (!tutor || tutor.status !== "approved") {
		return next(new ErrorResponse("Tutor not found", 404));
	}

	const [bookingsByTutor, reviewsByTutorUser] = await Promise.all([
		getBookingsByTutor([tutor]),
		getReviewsByTutorUser([tutor]),
	]);

	res.status(200).json({
		success: true,
		data: formatTutorData(tutor, bookingsByTutor, reviewsByTutorUser),
	});
});

// @desc    Delete a tutor
// @route   DELETE /api/tutors/:id
// @access  Private/Admin
exports.deleteTutor = asyncHandler(async (req, res, next) => {
	const tutor = await TutorApplication.findById(req.params.id);

	if (!tutor) {
		return next(new ErrorResponse("Tutor not found", 404));
	}

	// Change linked user role back to student
	await User.findByIdAndUpdate(tutor.user, {
		role: "student",
	});

	// Delete tutor application record
	await tutor.deleteOne();

	res.status(200).json({
		success: true,
		message: "Tutor removed successfully, and the user is now a student",
	});
});
