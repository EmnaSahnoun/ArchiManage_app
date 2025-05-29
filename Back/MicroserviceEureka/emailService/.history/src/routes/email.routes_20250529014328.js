const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');

router.post('/send', emailController.sendEmail);
router.get('/sent', emailController.getSentEmails);
router.delete('/:emailId', emailController.deleteEmail);
router.post('/:emailId/restore', emailController.restoreEmail);
router.get('/inbox', emailController.getInboxEmails);
router.post('/mark-as-read', emailController.markAsRead);
router.get('/check-email-read/:emailId', emailController.checkEmailRead);

module.exports = router;