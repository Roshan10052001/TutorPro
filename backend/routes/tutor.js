const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
	getTutors,
	getTutorById,
	deleteTutor,
} = require("../controllers/tutorController");

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
router.get("/", protect, getTutors);

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
router.get("/:id", protect, getTutorById);

module.exports = router;

/**
 * @swagger
 * /tutors/{id}:
 *   delete:
 *     summary: Delete a tutor
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
 *         description: Tutor deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Tutor not found
 */
router.delete("/:id", protect, authorize("admin"), deleteTutor);
