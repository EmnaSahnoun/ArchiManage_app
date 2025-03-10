const Company = require('../models/Company');

const createCompany = async (req, res) => {
  try {
    const { name, address, email, phone, password } = req.body;

    // Vérifier si l'entreprise existe déjà
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: 'Une entreprise avec cet email existe déjà.' });
    }

    const newCompany = new Company({ name, address, email, phone, password });
    await newCompany.save();

    res.status(201).json(newCompany);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCompany = async (req, res) => {
    const { id } = req.params; // Récupère l'id de l'entreprise à partir des paramètres d'URL
    const { name, address, email, password, phone, createdAt } = req.body; // Récupère les nouvelles données
  
    try {
      // Rechercher l'entreprise par son ID et la mettre à jour
      const company = await Company.findByIdAndUpdate(
        id, 
        { name, address, email, password, phone, createdAt },
        { new: true } // Retourne le document mis à jour
      );
  
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      return res.status(200).json(company);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: 'Server Error' });
    }
  };

const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    await company.deleteOne();
    res.status(200).json({ message: "Entreprise supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
};
