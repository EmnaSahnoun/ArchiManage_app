const express = require("express");
const draftController = require("../controllers/draftController");

const router = express.Router();

// Récupérer les brouillons
router.get("/", draftController.getDraftsHandler);

// Supprimer un brouillon spécifique
router.delete("/:draftId", draftController.deleteDraftHandler);


router.post('/drafts/create', draftController.createDraft);
router.get('/drafts/list', draftController.getDraftsList);
router.delete('/drafts/:draftId', draftController.deleteDraft);
router.post('/drafts/:draftId/send', draftController.sendDraft);
module.exports = router;
