const express = require("express");
const emailController = require("../controllers/emailController");
const multer = require('multer');
const upload = multer();
const router = express.Router();

// Envoyer un email
router.post("/send", upload.any(), emailController.sendEmail);
router.get('/:emailId', emailController.getEmail);
router.get('/inbox/list', emailController.get);
router.get('/sent/list', emailController.getSent);
router.delete('/:emailId', emailController.deleteEmail);
router.post('/:emailId/read', emailController.markAsRead);


module.exports = router;
