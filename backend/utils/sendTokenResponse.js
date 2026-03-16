const generateToken = require("./generateToken");

const sendTokenResponse = (user, statusCode, res) => {
	const token = generateToken(user._id, user.role);

	const options = {
		expires: new Date(
			Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
		),
		httpOnly: true,
	};

	// secure cookie in production
	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}

	res
		.status(statusCode)
		.cookie("token", token, options)
		.json({
			success: true,
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
};

module.exports = sendTokenResponse;
