const express = require("express");
const { createTask, getTasks , updateTask, deleteTask, createsubTask } = require("../controllers/taskController");
const router = express.Router();

router.post('/', createTask);
router.post('/:taskId', createTask);

router.get('/:phaseId', getTasks);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
