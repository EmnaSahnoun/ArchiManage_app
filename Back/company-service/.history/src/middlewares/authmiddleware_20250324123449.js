const axios = require('axios');
require("dotenv").config();
const { verifyToken } = require('keycloak-connect');
const keycloakConfig = {
  realm: 'ArchiManage',
  authServerUrl: 'https://192.168.1.75:8443',
  clientId: 'ArchiManage-client'
};
const protect = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  try {
    // Valider le token avec Keycloak
    const response = await axios.get(
      `${process.env.KEYCLOAK_URL}/realms/ArchiManage/protocol/openid-connect/userinfo`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    req.user = {
      ...response.data,
      access_token: token
    };
    next();
  } catch (error) {
    console.error("Erreur de validation du token:", error);
    res.status(403).json({ message: "Token invalide" });
  }
};

module.exports = { protect };
