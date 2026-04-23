const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get my notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getMyNotifications = asyncHandler(async (req, res) => {
	const [items, unreadCount] = await Promise.all([
		Notification.find({ user: req.user._id })
			.sort({ createdAt: -1 })
			.limit(20),
		Notification.countDocuments({ user: req.user._id, read: false }),
	]);

	res.status(200).json({
		success: true,
		data: { items, unreadCount },
	});
});

// @desc    Mark a notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
exports.markNotificationRead = asyncHandler(async (req, res, next) => {
	const notification = await Notification.findOneAndUpdate(
		{ _id: req.params.id, user: req.user._id },
		{ read: true },
		{ new: true },
	);

	if (!notification) {
		return next(new ErrorResponse("Notification not found", 404));
	}

	res.status(200).json({ success: true, data: notification });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = asyncHandler(async (req, res) => {
	await Notification.updateMany(
		{ user: req.user._id, read: false },
		{ read: true },
	);

	res.status(200).json({ success: true });
});
