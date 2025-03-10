const express = require("express");
const { createProject, getProjects } = require("../controllers/phaseController");
const router = express.Router();

router.post("/create", createProject);
router.get("/all", getProjects);

module.exports = router;
