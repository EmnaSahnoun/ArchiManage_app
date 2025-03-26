const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwksClient = require("jwks-rsa");
require("dotenv").config();

// Middleware pour vérifier le token JWT
const protect = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
    }
    jwt.verify(token, getKey, { issuer: process.env.KEYCLOAK_ISSUER }, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Jeton invalide" });
        }
        req.user = decoded;
        next();
      });
    };

module.exports = { protect };
