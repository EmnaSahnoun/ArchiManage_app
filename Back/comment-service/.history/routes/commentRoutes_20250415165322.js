const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/:taskId', commentController.addComment);
router.get('/:taskId', commentController.getComments);

module.exports = router;
