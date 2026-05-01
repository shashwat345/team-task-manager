const express = require("express");
const router = express.Router();

const { createProject } = require("../controllers/projectController");
const { auth } = require("../middleware/authMiddleware");

// Create Project (protected)
router.post("/create", auth, createProject);

module.exports = router;