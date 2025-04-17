const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Route POST pour ajouter un commentaire
router.post('/:taskId', commentController.addComment);

// Route GET pour récupérer les commentaires
router.get('/:taskId', commentController.getComments);

module.exports = router;
