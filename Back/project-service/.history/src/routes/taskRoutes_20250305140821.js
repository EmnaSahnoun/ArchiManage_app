const express = require("express");
const { createProject, getProjects } = require("../controllers/taskController");
const router = express.Router();

router.post('/create', taskController.createTask);
router.get('/tasks/:phaseId', taskController.getTasks);
router.put('/tasks/:taskId', taskController.updateTask);
router.delete('/tasks/:taskId', taskController.deleteTask);

module.exports = router;
