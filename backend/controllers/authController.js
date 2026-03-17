const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const sendTokenResponse = require("../utils/sendTokenResponse");

exports.signup = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	const existingUser = await User.findOne({ email });

	if (existingUser) {
		return next(new ErrorResponse("User already exists", 400));
	}

	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new ErrorResponse("Please provide an email and password", 400));
	}

	const user = await User.findOne({ email }).select("+password");

	if (!user) {
		return next(new ErrorResponse("Invalid credentials", 401));
	}

	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return next(new ErrorResponse("Invalid credentials", 401));
	}

	sendTokenResponse(user, 200, res);
});

exports.logout = (req, res) => {
	res.cookie("token", "none", {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});

	res.status(200).json({
		success: true,
		message: "Logged out successfully",
	});
};
