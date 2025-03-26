const Company = require("../models/Company");
const axios = require("axios");

const createCompany = async (req, res) => {
  try {
    // 1. Vérification du token
    if (!req.user?.access_token) {
      return res.status(401).json({ error: "Token manquant" });
    }

    // 2. Création du groupe
    const groupResponse = await axios.post(
      `${process.env.KEYCLOAK_URL}/admin/realms/ArchiManage/groups`,
      { name: req.body.name },
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJpempnNVJORUM1ZFpJNlJRZnNBOXJ2YVlVVU8tbk0taEJfS3FkQU1RYlFvIn0.eyJleHAiOjE3NDI4MjcyNDUsImlhdCI6MTc0MjgyNjk0NSwianRpIjoiOWQ2Njk3M2ItZTVkYy00ZjJlLWE3MDItMWRiMzhiY2Q3OTkzIiwiaXNzIjoiaHR0cHM6Ly8xOTIuMTY4LjQ3LjIwNzo4NDQzL3JlYWxtcy9BcmNoaU1hbmFnZSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI0YjFhNDBjYS00NTQ3LTQ5OTMtYmQ1Ni1mZTM0NDA0NzRiMWYiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJBcmNoaU1hbmFnZS1jbGllbnQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLWFyY2hpbWFuYWdlIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE5Mi4xNjguNDcuMTM4IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtYXJjaGltYW5hZ2UtY2xpZW50IiwiY2xpZW50QWRkcmVzcyI6IjE5Mi4xNjguNDcuMTM4IiwiY2xpZW50X2lkIjoiQXJjaGlNYW5hZ2UtY2xpZW50In0.inCdyT6-GInAX0KvuO5E9tfjrvQ62SkB4xOvA-Tk1L5voUsixxRN8ZaCuS1ayJ0-C1J5bt7NNiqqiS5g3NBIaI0i82aWoLrNNkxcwJEpO0SLu5ijGgx3U08I8R-g8buNj3scF98rjI3wKsvQAr5ptMZurVSHpYY-StNMVYuq0G0Ovp5QZc3LJK_iREApBjALx5Z7Isx-o7zfcKaHFIXNm7oGOTrBMbshO5CVeB0oH58-_xfbboZz_7lcU9k4MnkV9YtlhRkHj5M2lWjHGpIi_xvE-P1gfJlY4CK967wSQzT2X_E1UhenpjcY8hKGxl1stLJWTBvFSzpBrZHje7K7kQ`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
      }
    );

    // 3. Création en DB
    const company = new Company({
      ...req.body,
      keycloakGroupId: groupResponse.data.id
    });
    await company.save();

    return res.status(201).json(company);

  } catch (err) {
    console.error("ERREUR COMPLETE:", {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    return res.status(500).json({
      error: "Erreur serveur",
      details: err.response?.data || err.message
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
