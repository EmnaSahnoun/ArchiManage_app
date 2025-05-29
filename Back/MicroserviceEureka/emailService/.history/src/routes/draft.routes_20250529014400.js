const express = require('express');
const router = express.Router();
const draftController = require('../controllers/draft.controller');

router.get('/', draftController.getDrafts);
router.delete('/:draftId', draftController.deleteDraft);
//router.post('/drafts', draftController.createDraft);
//router.put('/drafts/:draftId', draftController.updateDraft);

module.exports = router;