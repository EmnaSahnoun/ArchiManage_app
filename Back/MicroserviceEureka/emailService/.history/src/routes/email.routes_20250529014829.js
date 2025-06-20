const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller'); // Assurez-vous que ce chemin est correct

router.post('/send', emailController.sendEmail);
router.get('/sent', emailController.getSentEmails);
router.delete('/:emailId', emailController.deleteEmail);
router.post('/:emailId/restore', emailController.restoreEmail);
router.get('/inbox', emailController.getInboxEmails);
router.post('/mark-as-read', emailController.markAsRead);
router.get('/:emailId/read-status', emailController.checkEmailRead);

module.exports = router;