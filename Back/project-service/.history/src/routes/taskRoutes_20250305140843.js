const express = require("express");
const { createProject, getProjects } = require("../controllers/taskController");
const router = express.Router();

router.post('/', taskController.createTask);
router.get('/:phaseId', taskController.getTasks);
router.put('/:taskId', taskController.updateTask);
router.delete('/tasks/:taskId', taskController.deleteTask);

module.exports = router;
