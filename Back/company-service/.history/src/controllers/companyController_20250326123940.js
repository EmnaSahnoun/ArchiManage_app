const Company = require("../models/Company");
const axios = require("axios");
const keycloakConfig = require("../config/keycloa");
const createCompany = async (req, res) => {
  try {
    // Vérifier le rôle ADMIN
    if (!req.user.realm_access?.roles.includes('ADMIN')) {
      return res.status(403).json({ error: "Accès refusé: rôle ADMIN requis" });
    }

    // Configuration admin Keycloak
    const adminToken = await getAdminToken();
    
    // Création du groupe dans Keycloak
    const groupResponse = await axios.post(
      `${keycloakConfig.authServerUrl}/admin/realms/${keycloakConfig.realm}/groups`,
      { name: req.body.name },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Création en DB
    const company = new Company({
      ...req.body,
      keycloakGroupId: groupResponse.data.id
    });
    await company.save();

    return res.status(201).json(company);
  } catch (err) {
    // Gestion erreur...
  }
};

// Fonction pour obtenir le token admin
async function getAdminToken() {
  const response = await axios.post(
    `${keycloakConfig.authServerUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
    new URLSearchParams({
      client_id: keycloakConfig.clientId,
      client_secret: 'YAJwi66994BLrtEF5z7PDkUNlhv5QVrY',
      grant_type: 'client_credentials'
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return response.data.access_token;
}



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
