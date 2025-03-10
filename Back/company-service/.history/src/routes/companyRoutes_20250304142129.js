const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// Créer une nouvelle entreprise
router.post('/', async (req, res) => {
  try {
    const { name, address, email, phone, password } = req.body;

    const newCompany = new Company({
      name,
      address,
      email,
      phone,
      password,  // Dans une vraie application, tu devrais hacher le mot de passe
    });

    await newCompany.save();
    res.status(201).json(newCompany);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer toutes les entreprises
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
