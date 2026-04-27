const TutorApplication = require("../models/TutorApplication");
const User = require("../models/User");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const {
	scoreApplication,
	generateNoteSuggestions,
	polishNote,
} = require("../services/aiScoringService");

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

async function notifyAdminsOfTutorApplication(application) {
	const admins = await User.find({ role: "admin" }).select("_id");

	if (!admins.length) return;

	await Notification.insertMany(
		admins.map((admin) => ({
			user: admin._id,
			type: "tutor_application_submitted",
			title: "New tutor application",
			message: `${application.name} applied to tutor ${application.course}.`,
			targetPath: `/admin/tutor-applications?application=${application._id}`,
		})),
	);
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

	try {
		await notifyAdminsOfTutorApplication(application);
	} catch (err) {
		console.error("Failed to create tutor application notification:", err);
	}

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

// @desc    Generate AI-assisted admin notes (suggest or polish)
// @route   POST /api/v1/tutor-applications/:id/admin-notes
// @access  Private/Admin
exports.generateAdminNotes = asyncHandler(async (req, res, next) => {
	const { mode, draft } = req.body;

	if (!["suggest", "polish"].includes(mode)) {
		return next(new ErrorResponse("mode must be 'suggest' or 'polish'", 400));
	}

	const application = await TutorApplication.findById(req.params.id);
	if (!application) {
		return next(new ErrorResponse("Tutor application not found", 404));
	}

	if (mode === "suggest") {
		const result = await generateNoteSuggestions(application);
		if (result.error) {
			return next(new ErrorResponse(result.error, 502));
		}
		return res.status(200).json({ success: true, data: result });
	}

	if (typeof draft !== "string" || !draft.trim()) {
		return next(new ErrorResponse("draft is required for polish mode", 400));
	}

	const result = await polishNote(application, draft.trim());
	if (result.error) {
		return next(new ErrorResponse(result.error, 502));
	}
	return res.status(200).json({ success: true, data: result });
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

	if (!["approved", "rejected", "changes_requested"].includes(status)) {
		return next(new ErrorResponse("Invalid status value", 400));
	}

	const application = await TutorApplication.findById(req.params.id);

	if (!application) {
		return next(new ErrorResponse("Tutor application not found", 404));
	}

	const previousStatus = application.status;
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

	if (previousStatus !== status) {
		try {
			await Notification.create({
				user: application.user,
				type: "tutor_application_decision",
				title:
					status === "approved"
						? "Tutor application approved"
						: status === "changes_requested"
							? "Tutor application changes requested"
							: "Tutor application rejected",
				message:
					status === "approved"
						? `Your ${application.course} tutor application was approved.`
						: status === "changes_requested"
							? `Changes were requested for your ${application.course} tutor application.`
							: `Your ${application.course} tutor application was rejected.`,
				targetPath:
					status === "approved"
						? `/tutor/tutor-apply?application=${application._id}`
						: `/student/tutor-apply?application=${application._id}`,
			});
		} catch (err) {
			console.error(
				"Failed to create tutor application decision notification:",
				err,
			);
		}
	}

	res.status(200).json({
		success: true,
		message: "Tutor application status updated successfully",
		data: application,
	});
});

// @desc    Resubmit tutor application after changes requested
// @route   PUT /api/v1/tutor-applications/:id/resubmit
// @access  Private
exports.resubmitTutorApplication = asyncHandler(async (req, res, next) => {
	const { course, availability, bio } = req.body;

	if (!course || !bio) {
		return next(new ErrorResponse("Please provide all required fields", 400));
	}

	if (!Array.isArray(availability) || availability.length === 0) {
		return next(
			new ErrorResponse("Please provide at least one availability slot", 400),
		);
	}

	const application = await TutorApplication.findOne({
		_id: req.params.id,
		user: req.user._id,
		status: "changes_requested",
	});

	if (!application) {
		return next(
			new ErrorResponse("Application not found or cannot be resubmitted", 404),
		);
	}

	application.course = course;
	application.availability = availability;
	application.bio = bio;
	application.status = "pending";
	application.adminNotes = "";
	application.aiScore = undefined;

	await application.save();

	scoreInBackground(application._id);

	try {
		await notifyAdminsOfTutorApplication(application);
	} catch (err) {
		console.error(
			"Failed to notify admins of tutor application resubmission:",
			err,
		);
	}

	res.status(200).json({
		success: true,
		message: "Tutor application resubmitted successfully",
		data: application,
	});
});
