const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
	submitTutorApplication,
	getTutorApplications,
	getAllTutorApplications,
	updateTutorApplicationStatus,
} = require("../controllers/tutorApplicationController");

router.post("/", protect, submitTutorApplication);
router.get("/", protect, getTutorApplications);
router.get("/all", protect, getAllTutorApplications);
router.put("/:id", protect, updateTutorApplicationStatus);

module.exports = router;
