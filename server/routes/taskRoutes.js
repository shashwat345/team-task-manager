const express = require("express");
const router = express.Router();

const {
  createTask,
  updateTaskStatus,
  getTasks,
  deleteTask,
  assignTeam
} = require("../controllers/taskController");

const { auth } = require("../middleware/authMiddleware");

// Create Task
router.post("/create", auth, createTask);

// Update Status
router.put("/update/:id", auth, updateTaskStatus);

// Get All Tasks
router.get("/all", auth, getTasks);

// 🔥 Delete Task
router.delete("/delete/:id", auth, deleteTask);

// 🔥 Assign Team
router.put("/assign-team/:id", auth, assignTeam);

module.exports = router;