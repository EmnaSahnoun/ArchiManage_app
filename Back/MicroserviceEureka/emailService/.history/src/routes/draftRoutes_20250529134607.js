const express = require("express");
const draftController = require("../controllers/draftController");

const router = express.Router();

router.post('/create', draftController.createDraft);
router.get('/list', draftController.getDraftsList);
router.delete('/:draftId', draftController.deleteDraft);
router.post('/:draftId/send', draftController.sendDraft);

module.exports = router;
