const express = require("express");
const { createTask, getTasks , updateTask, deleteTask } = require("./controllers/taskController");
const router = express.Router();

router.post('/', createTask);
router.get('/:phaseId', taskController.getTasks);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
