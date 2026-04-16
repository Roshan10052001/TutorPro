const User = require("../models/User");
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

	user.name = req.body.name ?? user.name;
	user.email = req.body.email ?? user.email;
	user.phone = req.body.phone ?? user.phone;
	user.address = req.body.address ?? user.address;
	user.major = req.body.major ?? user.major;
	user.year = req.body.year ?? user.year;
	user.subjects = req.body.subjects ?? user.subjects;
	user.experience = req.body.experience ?? user.experience;

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

	await user.remove();

	res.status(200).json({
		success: true,
		message: "User profile deleted successfully",
	});
});
