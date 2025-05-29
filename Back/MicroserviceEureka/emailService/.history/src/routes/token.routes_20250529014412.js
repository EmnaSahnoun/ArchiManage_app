const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');



router.post('/refresh', tokenController.refreshToken);
module.exports = router;
