const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const {
	submitTutorApplication,
	getTutorApplications,
	getAllTutorApplications,
	updateTutorApplicationStatus,
} = require("../controllers/tutorApplicationController");

router.post("/", protect, authorize("tutor"), submitTutorApplication);
router.get("/", protect, getTutorApplications);
router.get("/all", protect, authorize("admin"), getAllTutorApplications);
router.put("/:id", protect, authorize("admin"), updateTutorApplicationStatus);

module.exports = router;
