const TutorApplication = require("../models/TutorApplication");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

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

	// Format data for frontend
	const tutors = applications.map((app) => ({
		_id: app._id,
		name: app.name,
		email: app.email,
		course: app.course,
		bio: app.bio,
		availability: app.availability || [],
		status: app.status,
		rating: 5, // Placeholder rating, since we don't have a rating system yet
	}));

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

	res.status(200).json({
		success: true,
		data: {
			id: tutor._id,
			_id: tutor._id,
			name: tutor.name,
			email: tutor.email,
			course: tutor.course,
			bio: tutor.bio,
			availability: tutor.availability || [],
			status: tutor.status,
			rating: 5,
		},
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
