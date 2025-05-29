const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/auth/google', authController.getAuthUrl);
router.get('/auth/google/callback', authController.handleCallback);

module.exports = router;