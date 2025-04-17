const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Ajouter un commentaire
router.post('/:taskId', commentController.addComment);

// Récupérer les commentaires
router.get('/:taskId', commentController.getComments);

// Supprimer un commentaire
router.delete('/:taskId', commentController.deleteComment);  // Supprimer tout le fichier de commentaires pour une tâche donnée

// Modifier un commentaire
router.put('/:taskId/:commentId', commentController.updateComment);  // Modifier un commentaire spécifique (par exemple, avec un commentaireId)

module.exports = router;
