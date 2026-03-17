const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get all tutors
// @route   GET /api/v1/tutors
// @access  Private
router.get(
	"/",
	protect,
	asyncHandler(async (req, res, next) => {
		const { course, name, page = 1, limit = 10 } = req.query;

		const query = { role: "tutor" };

		// Filter by name (partial, case-insensitive)
		if (name) {
			query.name = { $regex: name, $options: "i" };
		}

		// Filter by course if the User model has a courses field
		if (course) {
			query.courses = course;
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const tutors = await User.find(query)
			.skip(skip)
			.limit(parseInt(limit))
			.sort({ name: 1 });

		const total = await User.countDocuments(query);

		res.status(200).json({
			success: true,
			count: tutors.length,
			total,
			page: parseInt(page),
			pages: Math.ceil(total / parseInt(limit)),
			data: tutors,
		});
	}),
);

// @desc    Get single tutor by ID
// @route   GET /api/v1/tutors/:id
// @access  Private
router.get(
	"/:id",
	protect,
	asyncHandler(async (req, res, next) => {
		const tutor = await User.findById(req.params.id);

		if (!tutor || tutor.role !== "tutor") {
			return next(new ErrorResponse("Tutor not found", 404));
		}

		res.status(200).json({
			success: true,
			data: tutor,
		});
	}),
);

module.exports = router;