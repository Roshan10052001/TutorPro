const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},

		name: {
			type: String,
			required: true,
			trim: true,
		},

		department: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Course", courseSchema);
