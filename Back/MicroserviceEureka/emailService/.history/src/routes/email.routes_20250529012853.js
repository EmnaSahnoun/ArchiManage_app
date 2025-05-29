const express = require('express');
const router = express.Router();
const draftController = require('../controllers/email.controller');

router.post('/send-email', emailController.sendEmail);
router.get('/sent-emails', emailController.getSentEmails);
router.delete('/emails/:emailId', emailController.deleteEmail);
router.post('/emails/:emailId/restore', emailController.restoreEmail);
router.get('/inbox-emails', emailController.getInboxEmails);
router.post('/mark-as-read', emailController.markAsRead);
router.get('/check-email-read/:emailId', emailController.checkEmailRead);