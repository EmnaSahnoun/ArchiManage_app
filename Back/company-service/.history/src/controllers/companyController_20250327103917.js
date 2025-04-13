const Company = require("../models/Company");
const axios = require("axios");
const keycloakConfig = require("../config/keycloak");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { protect, requireRole } = require("../middlewares/authmiddleware");
const createCompany = async (req, res) => {
  try {
    // Validation étendue
    const { name, address, email, phone, password } = req.body;
    const requiredFields = { name, address, email, phone, password };
    
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ error: `Le champ ${field} est requis` });
      }
    }

    // Vérification format email
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Création du groupe dans Keycloak
    const adminToken = await getAdminToken();
    const groupResponse = await axios.post(
      `${keycloakConfig.authServerUrl}/admin/realms/${keycloakConfig.realm}/groups`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Création en DB
    const company = new Company({
      name,
      address,
      email,
      phone,
      password: hashedPassword,
      keycloakGroupId: groupResponse.data.id
    });

    await company.save();
    return res.status(201).json({
      _id: company._id,
      name: company.name,
      email: company.email,
      keycloakGroupId: company.keycloakGroupId
      
    });

  } catch (err) {
    // Gestion des erreurs 
    if (err.code === 11000) {
      return res.status(409).json({ 
        error: "Conflit",
        message: "Une entreprise avec ce nom ou cet email existe déjà"
      });
    }
    if (err.response?.status === 409) {
      return res.status(409).json({ 
        error: "Conflit Keycloak", 
        message: "Un groupe avec ce nom existe déjà dans Keycloak" 
      });
    }
    
    console.error('Erreur création company:', err);
    res.status(500).json({ 
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la création de l'entreprise"
    });
  }
};

// Fonction pour obtenir le token admin
async function getAdminToken() {
  try {
    const response = await axios.post(
      `${keycloakConfig.authServerUrl}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        username: keycloakConfig.adminUser,
        password: keycloakConfig.adminPassword,
        client_id: 'admin-cli',
        grant_type: 'password'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (err) {
    console.error('Erreur lors de la récupération du token admin:', err.response?.data || err.message);
    throw new Error('Impossible de récupérer le token admin Keycloak');
  }
}



const getCompanies = async (req, res) => {
  try {
      let companies;
      
      if (req.user.roles.includes('ADMIN')) {
          // Les admins voient toutes les entreprises
          companies = await Company.find();
      } else {
          // Les autres utilisateurs ne voient que les entreprises de leurs groupes
          const userGroups = req.user.groups || [];
          companies = await Company.find({ 
              keycloakGroupId: { $in: userGroups } 
          });
      }
      
      res.status(200).json(companies);
  } catch (error) {
      res.status(500).json({ 
          error: "Erreur lors de la récupération des entreprises",
          details: error.message 
      });
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
    const users = await axios.get(`${keycloakConfig.authServerUrl}/admin/realms/${keycloakConfig.realm}/users`,
            {
                headers: {
                    Authorization: `Bearer ${await getAdminToken()}`
                }
            }

    );
    res.json(users.data);
} catch (err) {
    res.status(500).json({
       error: err.message });
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
