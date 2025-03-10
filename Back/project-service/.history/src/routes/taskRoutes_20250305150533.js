const express = require("express");
const { createTask, getTasks , updateTask, deleteTask, createsubTask, getTaskById } = require("../controllers/taskController");
const router = express.Router();

router.post('/', createTask);
router.post('/subtask', createsubTask);

router.get('/:phaseId', getTasks);
router.get("/getbyid/:taskId",getTaskById)
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
