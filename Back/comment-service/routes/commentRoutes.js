const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// POST /comments/:taskId - Add a new comment
router.post('/:taskId', commentController.addComment);

// GET /comments/:taskId - Get all comments for a task
router.get('/:taskId', commentController.getComments);

// DELETE /comments/:taskId/:commentId - Delete a specific comment
router.delete('/:taskId/:commentId', commentController.deleteComment);

// PUT /comments/:taskId/:commentId - Update a specific comment
router.put('/:taskId/:commentId', commentController.updateComment);

module.exports = router;