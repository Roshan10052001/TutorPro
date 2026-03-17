const express = require("express");
const router = express.Router();
const { signup, login, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.post("/logout", logout);

// Get current logged-in user
router.get("/me", protect, async(req, res) {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

module.exports = router;
