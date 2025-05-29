const express = require("express");
const draftController = require("../controllers/draftController");

const router = express.Router();

// Récupérer les brouillons
router.get("/", draftController.getDraftsHandler);

// Supprimer un brouillon spécifique
router.delete("/:draftId", draftController.deleteDraftHandler);

module.exports = router;
