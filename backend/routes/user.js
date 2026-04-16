const express = require("express");
const router = express.Router();
const {
	updateProfile,
	deleteProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteProfile);

module.exports = router;
