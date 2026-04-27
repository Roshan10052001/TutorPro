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
		// availability: {
		// 	type: [String],
		// 	required: true,
		// 	validate: {
		// 		validator: function (value) {
		// 			return Array.isArray(value) && value.length > 0;
		// 		},
		// 		message: "At least one availability slot is required",
		// 	},
		// },
		availability: {
			type: [
				{
					day: {
						type: String,
						required: true,
						enum: [
							"Monday",
							"Tuesday",
							"Wednesday",
							"Thursday",
							"Friday",
							"Saturday",
							"Sunday",
						],
					},
					startTime: {
						type: String,
						required: true,
						trim: true,
					},
					endTime: {
						type: String,
						required: true,
						trim: true,
					},
					sessionLengthMinutes: {
						type: Number,
						required: true,
						min: 15,
					},
				},
			],
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
			maxlength: 1000,
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected", "changes_requested"],
			default: "pending",
		},
		adminNotes: {
			type: String,
			default: "",
		},
		aiScore: {
			recommendation: {
				type: String,
				enum: ["approve", "reject", "needs_review"],
			},
			confidence: {
				type: Number,
				min: 0,
				max: 1,
			},
			reasons: {
				type: [String],
				default: undefined,
			},
			scoredAt: Date,
			model: String,
			error: String,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("TutorApplication", tutorApplicationSchema);
