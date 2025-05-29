const express = require('express');
const router = express.Router();
const authController = require('../controllers/draft.controller');

router.get('/drafts', draftController.getDrafts);
router.delete('/drafts/:draftId', draftController.deleteDraft);
