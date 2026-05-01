const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");

// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

// Protected Route
router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected route access ho gaya 🔐",
    user: req.user
  });
});

module.exports = router;