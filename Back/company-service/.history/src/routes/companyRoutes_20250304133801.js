const express = require('express');
const { createCompany, assignUserToCompany, getCompanies } = require('../controllers/co');
const { protect } = require('../middlewares/authmiddleware');

const router = express.Router();

router.post('/create', protect, createCompany);
router.post('/assign-user', protect, assignUserToCompany);
router.get('/', protect, getCompanies);

module.exports = router;
