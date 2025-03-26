const Company = require("../models/Company");
const axios = require("axios");

const createCompany = async (req, res) => {
  try {
    // Debug 1: Vérifiez l'arrivée des données
    console.log("Request received with body:", JSON.stringify(req.body, null, 2));
    console.log("User object:", JSON.stringify(req.user, null, 2));

    // Debug 2: Vérifiez la connexion Keycloak
    const keycloakUrl = 'https://192.168.47.207:8443/admin/realms/ArchiManage/groups';
    console.log("Attempting to connect to:", keycloakUrl);

    // Debug 3: Envoyez une requête test
    const testResponse = await axios.get('https://192.168.47.207:8443', {
      httpsAgent: new (require('https').Agent({ rejectUnauthorized: false })
    });
    console.log("Keycloak connection test:", testResponse.status);

    // Création du groupe
    const groupResponse = await axios.post(
      keycloakUrl,
      { name: req.body.name },
      {
        headers: {
          Authorization: `Bearer ${req.user.access_token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new (require('https').Agent({ rejectUnauthorized: false })
      }
    );

    console.log("Keycloak response:", groupResponse.data);

    // Création en base de données
    const company = new Company({
      name: req.body.name,
      address: req.body.address,
      email: req.body.email,
      phone: req.body.phone,
      keycloakGroupId: groupResponse.data.id
    });

    await company.save();
    return res.status(201).json(company);

  } catch (error) {
    console.error("FULL ERROR LOG:", {
      message: error.message,
      response: error.response?.data,
      config: error.config,
      stack: error.stack
    });
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.response?.data || error.message,
      advice: "Check server logs for full error details"
    });
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
  try {
    const { id } = req.params;
    const { name, address, email, phone } = req.body;
    const ownerId = req.user.sub;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    if (company.ownerId !== ownerId) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    company.name = name || company.name;
    company.address = address || company.address;
    company.email = email || company.email;
    company.phone = phone || company.phone;

    await company.save();
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.sub;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    if (company.ownerId !== ownerId) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    await company.deleteOne();
    res.status(200).json({ message: "Entreprise supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUsers = async (req, res) => {
  try {
    const users = await axios.get("https://localhost:8443/admin/realms/ArchiManage/users");
    res.json(users.data);
} catch (err) {
    res.status(500).json({ error: err.message });
}
};
const addUserToCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { userId, name, email, phone } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    // Ajouter l'utilisateur au groupe Keycloak
    await axios.put(
      `${process.env.KEYCLOAK_URL}/admin/realms/ArchiManage/users/${userId}/groups/${company.keycloakGroupId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${req.user.access_token}`, // Token admin Keycloak
        },
      }
    );

    company.users.push({ userId, name, email, phone });
    await company.save();

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getUsers,
  addUserToCompany
};
