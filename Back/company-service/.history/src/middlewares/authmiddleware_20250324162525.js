const axios = require('axios');
const { createRemoteJWKSet, jwtVerify } = require('jose');
const { URL } = require('url');
require("dotenv").config();
const { verifyToken } = require('keycloak-connect');

const keycloakConfig = {
  realm: 'ArchiManage',
  authServerUrl: 'https://192.168.47.207:8443',
  clientId: 'ArchiManage-client'
};

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('Token manquant');
    
    const decoded = await verifyToken(token, keycloakConfig);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).send('Token invalide');
  }
};

module.exports = { protect };
