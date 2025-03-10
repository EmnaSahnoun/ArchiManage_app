const express = require("express");
const { createTask, getTasks } = require("./controllers/taskController");
const router = express.Router();

router.post('/', createTask);
router.get('/:phaseId', taskController.getTasks);
router.put('/:taskId', taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;
