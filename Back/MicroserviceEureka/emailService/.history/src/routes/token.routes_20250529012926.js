const express = require('express');
const router = express.Router();
const emailController = require('../controllers/token.controller');



router.post('/refresh-token', tokenController.refreshToken);