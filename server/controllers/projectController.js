const Project = require("../models/Project");

// Create Project
exports.createProject = async (req, res) => {
  try {
    const { name } = req.body;

    const project = await Project.create({
      name,
      members: [req.user.id] // creator automatically member
    });

    res.json(project);
  } catch (err) {
    res.status(500).send("Error creating project");
  }
};