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

const JWKS = createRemoteJWKSet(new URL(`${keycloakConfig.authServerUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/certs`));

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send('Token manquant');
    
    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${keycloakConfig.authServerUrl}/realms/${keycloakConfig.realm}`,
      audience: keycloakConfig.clientId
    });
    
    req.user = payload;
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    res.status(403).send('Token invalide ou expiré');
  }
};

const adminOnly = async (req, res, next) => {
  if (!req.user?.realm_access?.roles.includes('admin')) {
    return res.status(403).send('Accès refusé: droits insuffisants');
  }
  next();
};

module.exports = { protect, adminOnly };