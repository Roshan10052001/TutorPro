const TutorApplication = require("../models/TutorApplication");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const { scoreApplication } = require("../services/aiScoringService");

function scoreInBackground(applicationId) {
	TutorApplication.findById(applicationId)
		.then(async (application) => {
			if (!application) return;
			const aiScore = await scoreApplication(application);
			application.aiScore = aiScore;
			await application.save();
		})
		.catch((err) => {
			console.error("AI scoring failed:", err.message);
		});
}

// @desc    Submit tutor application
// @route   POST /api/v1/tutor-applications
// @access  Private
exports.submitTutorApplication = asyncHandler(async (req, res, next) => {
	const { course, availability, bio } = req.body;

	const name = req.user.name;
	const email = req.user.email;

	if (!name || !email || !course || !bio) {
		return next(new ErrorResponse("Please provide all required fields", 400));
	}

	if (!Array.isArray(availability) || availability.length === 0) {
		return next(
			new ErrorResponse("Please provide at least one availability slot", 400),
		);
	}

	const existingPendingApplication = await TutorApplication.findOne({
		user: req.user._id,
		course,
		status: "pending",
	});

	if (existingPendingApplication) {
		return next(
			new ErrorResponse(
				"You already have a pending application for this course",
				400,
			),
		);
	}

	const application = await TutorApplication.create({
		user: req.user._id,
		name,
		email,
		course,
		availability,
		bio,
	});

	scoreInBackground(application._id);

	res.status(201).json({
		success: true,
		message: "Tutor application submitted successfully",
	});
});

// @desc    Re-score tutor application with AI (admin only)
// @route   POST /api/v1/tutor-applications/:id/score
// @access  Private/Admin
exports.rescoreTutorApplication = asyncHandler(async (req, res, next) => {
	const application = await TutorApplication.findById(req.params.id);

	if (!application) {
		return next(new ErrorResponse("Tutor application not found", 404));
	}

	const aiScore = await scoreApplication(application);
	application.aiScore = aiScore;
	await application.save();

	res.status(200).json({
		success: true,
		message: "Tutor application re-scored",
		data: application,
	});
});

// @desc    Get tutor applications for current user
// @route   GET /api/v1/tutor-applications
// @access  Private
exports.getTutorApplications = asyncHandler(async (req, res, next) => {
	const applications = await TutorApplication.find({ user: req.user._id });

	res.status(200).json({
		success: true,
		count: applications.length,
		data: applications,
	});
});

// @desc    Get all tutor applications (admin only)
// @route   GET /api/v1/tutor-applications/all
// @access  Private/Admin
exports.getAllTutorApplications = asyncHandler(async (req, res, next) => {
	const applications = await TutorApplication.find().populate(
		"user",
		"name email",
	);

	res.status(200).json({
		success: true,
		count: applications.length,
		data: applications,
	});
});

// @desc    Update current tutor availability
// @route   PUT /api/v1/tutor-applications/me/availability
// @access  Private/Tutor
exports.updateMyTutorAvailability = asyncHandler(async (req, res, next) => {
	const { applicationId, availability } = req.body;

	if (!applicationId) {
		return next(new ErrorResponse("Tutor application id is required", 400));
	}

	if (!Array.isArray(availability) || availability.length === 0) {
		return next(
			new ErrorResponse("Please provide at least one availability slot", 400),
		);
	}

	const application = await TutorApplication.findOne({
		_id: applicationId,
		user: req.user._id,
		status: "approved",
	});

	if (!application) {
		return next(new ErrorResponse("Approved tutor application not found", 404));
	}

	application.availability = availability;
	await application.save();

	res.status(200).json({
		success: true,
		message: "Tutor availability updated successfully",
		data: application,
	});
});

// @desc    Update tutor application status (admin only)
// @route   PUT /api/v1/tutor-applications/:id
// @access  Private/Admin
exports.updateTutorApplicationStatus = asyncHandler(async (req, res, next) => {
	const { status, adminNotes } = req.body;

	if (!["approved", "rejected"].includes(status)) {
		return next(new ErrorResponse("Invalid status value", 400));
	}

	const application = await TutorApplication.findById(req.params.id);

	if (!application) {
		return next(new ErrorResponse("Tutor application not found", 404));
	}

	application.status = status;
	application.adminNotes = adminNotes || "";
	await application.save();

	if (status === "approved") {
		const user = await User.findById(application.user);

		if (!user) {
			return next(new ErrorResponse("Associated user not found", 404));
		}

		user.role = "tutor";
		await user.save();
	}

	res.status(200).json({
		success: true,
		message: "Tutor application status updated successfully",
		data: application,
	});
});
