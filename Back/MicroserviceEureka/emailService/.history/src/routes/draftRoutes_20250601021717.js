const express = require("express");
const draftController = require("../controllers/draftController");

const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage(); // Stockage en mémoire
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB
  }
});


router.post('/create', const storage = multer.memoryStorage(); // Stockage en mémoire
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB
  }
});
 draftController.createDraft);
router.get('/list', draftController.getDraftsList);
router.delete('/:draftId', draftController.deleteDraft);
router.post('/:draftId/send', draftController.sendDraft);

module.exports = router;
