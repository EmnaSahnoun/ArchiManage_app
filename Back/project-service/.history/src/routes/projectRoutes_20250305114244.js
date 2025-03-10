const express = require("express");
const Project = require("../models/Project");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate("phases");
    res.json(projects);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
