const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		type: {
			type: String,
			enum: [
				"booking_created",
				"booking_status_updated",
				"booking_cancelled",
				"tutor_application_submitted",
				"tutor_application_decision",
			],
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			default: "",
		},
		targetPath: {
			type: String,
			default: "",
			match: [/^\/[a-zA-Z0-9/_?=&%-]*$/, "Invalid targetPath"],
		},
		read: {
			type: Boolean,
			default: false,
			index: true,
		},
		relatedBooking: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Booking",
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
