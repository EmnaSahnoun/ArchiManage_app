const express = require("express");
const { createProject, getProjects } = require("../controllers/phconst express = require("express");
const { createProject, getProjects } = require("../controllers/projectController");
const router = express.Router();

router.post("/create", createProject);
router.get("/all", getProjects);

module.exports = router;
");
const router = express.Router();

router.post("/create", createProject);
router.get("/all", getProjects);

module.exports = router;
