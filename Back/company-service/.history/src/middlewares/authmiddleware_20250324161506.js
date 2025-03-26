// authMiddleware.js - Version corrigée
const axios = require('axios');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://192.168.47.207:8443/realms/ArchiManage/protocol/openid-connect/certs'
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('Token manquant');
    
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) return res.status(403).send('Token invalide');
      req.user = decoded;
      next();
    });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
};

module.exports = { protect };