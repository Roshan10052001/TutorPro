const express = require("express");
const router = express.Router();
const {
	updateProfile,
	deleteProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.put("/", protect, updateProfile);
router.delete("/", protect, deleteProfile);

module.exports = router;
