const express = require("express");
const draftController = require("../controllers/draftController");

const router = express.Router();

// Récupérer les brouillons
router.get("/", draftController.getDraftsHandler);

// Supprimer un brouillon spécifique
router.delete("/:draftId", draftController.deleteDraftHandler);


router.post('/drafts/create', emailController.createDraft);
router.get('/drafts/list', emailController.getDraftsList);
router.delete('/drafts/:draftId', emailController.deleteDraft);
router.post('/drafts/:draftId/send', emailController.sendDraft);
module.exports = router;
