const express = require("express");
const draftController = require("../controllers/draftController");

const router = express.Router();

router.post('/drafts/create', draftController.createDraft);
router.get('/drafts/list', draftController.getDraftsList);
router.delete('/drafts/:draftId', draftController.deleteDraft);
router.post('/drafts/:draftId/send', draftController.sendDraft);

module.exports = router;
