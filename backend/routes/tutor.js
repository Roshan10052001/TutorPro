const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

/**
 * @swagger
 * /tutors:
 *   get:
 *     summary: Get all tutors
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by tutor name (partial, case-insensitive)
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: List of tutors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
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

/**
 * @swagger
 * /tutors/{id}:
 *   get:
 *     summary: Get a single tutor by ID
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tutor user ID
 *     responses:
 *       200:
 *         description: Tutor data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Tutor not found
 */
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
