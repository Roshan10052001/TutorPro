const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
	createReview,
	getTutorReviews,
	getMyReviews,
	deleteReview,
} = require("../controllers/reviewController");

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a review for a completed session
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, rating]
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: ID of the completed booking being reviewed
 *                 example: 664f1a2b3c4d5e6f7a8b9c0d
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 example: Super helpful with recursion!
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid input, booking not completed, or already reviewed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not your booking, or role not permitted to review
 *       404:
 *         description: Booking not found
 */
router.post("/", protect, authorize("student"), createReview);

/**
 * @swagger
 * /reviews/me:
 *   get:
 *     summary: Get reviews authored by the logged-in student
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reviews authored by the current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Only students can access this endpoint
 */
router.get("/me", protect, authorize("student"), getMyReviews);

/**
 * @swagger
 * /reviews/tutor/{tutorId}:
 *   get:
 *     summary: Get all reviews for a tutor with aggregate rating
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tutor user ID
 *     responses:
 *       200:
 *         description: List of reviews for the tutor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 averageRating:
 *                   type: number
 *                   example: 4.75
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       401:
 *         description: Not authenticated
 */
router.get("/tutor/:tutorId", protect, getTutorReviews);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review (author or admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this review
 *       404:
 *         description: Review not found
 */
router.delete("/:id", protect, deleteReview);

module.exports = router;
