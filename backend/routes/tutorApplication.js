const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const {
	submitTutorApplication,
	getTutorApplications,
	getAllTutorApplications,
	updateMyTutorAvailability,
	updateTutorApplicationStatus,
} = require("../controllers/tutorApplicationController");

router.post("/", protect, submitTutorApplication);
router.get("/", protect, getTutorApplications);
router.get("/all", protect, authorize("admin"), getAllTutorApplications);
router.put(
	"/availability",
	protect,
	authorize("tutor"),
	updateMyTutorAvailability,
);
router.put("/:id", protect, authorize("admin"), updateTutorApplicationStatus);

module.exports = router;
