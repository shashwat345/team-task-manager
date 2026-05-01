const Task = require("../models/Task");

// Create Task
exports.createTask = async (req, res) => {
  try {
    const { title, assignedTo, project, dueDate, team } = req.body;

    const task = await Task.create({
      title,
      assignedTo: assignedTo || req.user.id,
      project,
      dueDate,
      team
    });

    res.json(task);
  } catch (err) {
    res.status(500).send("Error creating task");
  }
};

// Update Task Status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).send("Error updating task");
  }
};

// 🔥 Assign Team (FIXED BUG)
exports.assignTeam = async (req, res) => {
  try {
    const { team } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { team },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).send("Error assigning team");
  }
};

// 🔥 Delete Task
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).send("Error deleting task");
  }
};

// Get All Tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).send("Error fetching tasks");
  }
};