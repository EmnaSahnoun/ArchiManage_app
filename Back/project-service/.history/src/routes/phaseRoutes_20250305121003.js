const express = require("express");
const { createProject, getProjects } = require("../controllers/ph");
const router = express.Router();

router.post("/create", createProject);
router.get("/all", getProjects);

module.exports = router;
