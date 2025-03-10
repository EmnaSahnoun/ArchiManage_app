const express = require("express");
const { createProject, getProjects } = require("..taskController/controllers/taskController");
const router = express.Router();

router.post('/', taskController.createTask);
router.get('/:phaseId', taskController.getTasks);
router.put('/:taskId', taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;
