const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Ajouter un commentaire
router.post('/:taskId', commentController.addComment);

// Récupérer les commentaires
router.get('/:taskId', commentController.getComments);

// Supprimer un commentaire par ID
router.delete('/:taskId/:idCommentaire', commentController.deleteComment);  // Supprimer un commentaire en fonction de son ID

module.exports = router;
