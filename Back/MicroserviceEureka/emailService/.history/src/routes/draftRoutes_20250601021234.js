const express = require("express");
const draftController = require("../controllers/draftController");

const router = express.Router();
const multer = require('multer');
const upload = multer();

router.post('/create', upload.array('attachments'), draftController.createDraft);
router.get('/list', draftController.getDraftsList);
router.delete('/:draftId', draftController.deleteDraft);
router.post('/:draftId/send', draftController.sendDraft);

module.exports = router;
