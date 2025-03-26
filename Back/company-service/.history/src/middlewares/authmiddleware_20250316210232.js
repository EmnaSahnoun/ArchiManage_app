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

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Token invalide." });
    }
};
const client = jwksClient({
    jwksUri: process.env.KEYCLOAK_JWKS_URI,
  });
module.exports = { protect };
