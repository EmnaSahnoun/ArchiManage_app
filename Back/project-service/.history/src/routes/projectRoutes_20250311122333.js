const express = require("express");
const { createProject, getProjects } = require("../controllers/projectController");
const router = express.Router();

router.post("/", createProject);
router.get("/all", getProjects);
router.get("/:id"),getProjectById);

module.exports = router;
