const express = require("express");
const router = express.Router();
const {
	updateProfile,
	deleteProfile,
	deleteUserByAdmin,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteProfile);
router.delete("/:id", protect, authorize("admin"), deleteUserByAdmin);

module.exports = router;
