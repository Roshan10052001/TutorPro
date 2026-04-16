const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
	createBooking,
	getBookings,
	getBookingById,
	updateBookingStatus,
	cancelBooking,
	updateBooking,
	deleteBooking,
} = require("../controllers/bookingController");

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking (student books a tutor)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tutor, course, date, startTime, endTime]
 *             properties:
 *               tutor:
 *                 type: string
 *                 description: Tutor user ID
 *                 example: 664f1a2b3c4d5e6f7a8b9c0d
 *               course:
 *                 type: string
 *                 description: Course ID
 *                 example: 664f1a2b3c4d5e6f7a8b9c0e
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-15"
 *               startTime:
 *                 type: string
 *                 example: "10:00"
 *               endTime:
 *                 type: string
 *                 example: "11:00"
 *               notes:
 *                 type: string
 *                 example: Need help with recursion
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Cannot book in the past
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Tutor not found
 */
router.post("/", protect, authorize("student", "admin"), createBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings for the logged-in user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         description: Filter bookings by status
 *     responses:
 *       200:
 *         description: List of bookings
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
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Not authenticated
 */
router.get("/", protect, authorize("student", "tutor", "admin"), getBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this booking
 *       404:
 *         description: Booking not found
 */
router.get(
	"/:id",
	protect,
	authorize("student", "tutor", "admin"),
	getBookingById,
);

/**
 * @swagger
 * /bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (confirm / complete)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, completed, cancelled]
 *     responses:
 *       200:
 *         description: Booking status updated
 *       400:
 *         description: Invalid or missing status
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this booking
 *       404:
 *         description: Booking not found
 */
router.patch(
	"/:id/status",
	protect,
	authorize("tutor", "admin"),
	updateBookingStatus,
);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       400:
 *         description: Booking already cancelled or completed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to cancel this booking
 *       404:
 *         description: Booking not found
 */
router.patch("/:id/cancel", protect, cancelBooking);

//Swagger needed to be updated for the below routes

router.put(
	"/:id",
	protect,
	authorize("student", "tutor", "admin"),
	updateBooking,
);

router.delete(
	"/:id",
	protect,
	authorize("student", "tutor", "admin"),
	deleteBooking,
);

module.exports = router;
