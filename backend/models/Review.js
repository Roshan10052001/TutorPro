const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
	{
		student: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Student is required"],
		},
		tutor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Tutor is required"],
		},
		booking: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Booking",
			required: [true, "Booking is required"],
		},
		rating: {
			type: Number,
			required: [true, "Rating is required"],
			min: [1, "Rating must be at least 1"],
			max: [5, "Rating cannot exceed 5"],
			validate: {
				validator: Number.isInteger,
				message: "Rating must be an integer between 1 and 5",
			},
		},
		comment: {
			type: String,
			maxLength: 500,
			default: "",
		},
	},
	{
		timestamps: true,
	},
);

reviewSchema.index({ booking: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
