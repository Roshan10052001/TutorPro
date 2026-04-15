const mongoose = require("mongoose");

const tutorApplicationSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			trim: true,
			lowercase: true,
		},
		course: {
			type: String,
			required: [true, "Course is required"],
			trim: true,
		},
		availability: {
			type: [String],
			required: true,
			validate: {
				validator: function (value) {
					return Array.isArray(value) && value.length > 0;
				},
				message: "At least one availability slot is required",
			},
		},
		bio: {
			type: String,
			required: [true, "Bio is required"],
			trim: true,
			maxlength: 500,
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		},
		adminNotes: {
			type: String,
			default: "",
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("TutorApplication", tutorApplicationSchema);
