const express = require("express");
const { createProject, getProjects , getProjectById} = require("../controllers/projectController");
const router = express.Router();

router.post("/", createProject);
router.get("/all", getProjects);
router.get("/:projectId", getProjectById);

module.exports = router;
