const express = require('express');
const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');

const router = express.Router();

router.post('/', createCompany); 
router.get('/all', getCompanies); 
router.get('/:id', getCompanyById); 
router.put('/:id', updateCompany); // Mettre à jour une entreprise
router.delete('/:id', deleteCompany); // Supprimer une entreprise

module.exports = router;
