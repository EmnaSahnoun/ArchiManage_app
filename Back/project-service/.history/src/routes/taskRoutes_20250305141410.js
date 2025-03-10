const express = require("express");
const { createTask, getProjects } = require("./controllers/taskController");
const router = express.Router();

router.post('/', createTask);
router.get('/:phaseId', taskController.getTasks);
router.put('/:taskId', taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;
