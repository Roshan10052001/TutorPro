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
			enum: ["booking_created"],
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
