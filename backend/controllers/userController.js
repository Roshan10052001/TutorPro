const User = require("../models/User");
const TutorApplication = require("../models/TutorApplication");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user._id);

	if (!user) {
		return next(new ErrorResponse("User not found", 404));
	}

	const { name, email, phone, address, major, year, subjects, experience } =
		req.body;

	// Handle email change safely
	if (email !== undefined && email.trim().toLowerCase() !== user.email) {
		const normalizedEmail = email.trim().toLowerCase();

		// format check
		const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

		if (!emailRegex.test(normalizedEmail)) {
			return next(new ErrorResponse("Please enter a valid email", 400));
		}

		// uniqueness check
		const existingUser = await User.findOne({
			email: normalizedEmail,
			_id: { $ne: user._id },
		});

		if (existingUser) {
			return next(new ErrorResponse("Email is already in use", 400));
		}

		user.email = normalizedEmail;
	}

	if (name !== undefined) user.name = name;
	if (phone !== undefined) user.phone = phone;
	if (address !== undefined) user.address = address;
	if (major !== undefined) user.major = major;
	if (year !== undefined) user.year = year;
	if (subjects !== undefined) user.subjects = subjects;
	if (experience !== undefined) user.experience = experience;

	await user.save();

	res.status(200).json({
		success: true,
		data: user,
	});
});

//@desc Delete user profile
//@route DELETE /api/users/profile
//@access Private
exports.deleteProfile = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user._id);

	if (!user) {
		return next(new ErrorResponse("User not found", 404));
	}

	await user.deleteOne();

	res.status(200).json({
		success: true,
		message: "User profile deleted successfully",
	});
});

//@desc Delete a user account (admin only)
//@route DELETE /api/users/:id
//@access Private/Admin
exports.deleteUserByAdmin = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(new ErrorResponse("User not found", 404));
	}

	if (user._id.toString() === req.user._id.toString()) {
		return next(new ErrorResponse("Admins cannot delete their own account", 400));
	}

	await Promise.all([
		TutorApplication.deleteMany({ user: user._id }),
		Booking.deleteMany({
			$or: [{ student: user._id }, { tutor: user._id }],
		}),
	]);

	await user.deleteOne();

	res.status(200).json({
		success: true,
		message: "User account deleted successfully",
	});
});
