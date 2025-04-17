const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.get('/:taskId', historyController.getTaskHistory);

module.exports = router;