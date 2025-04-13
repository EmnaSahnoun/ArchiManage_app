const { createRemoteJWKSet, jwtVerify } = require('jose');
const { URL } = require('url');

const jwksUri = 'https://192.168.1.24:8443/realms/ArchiManage/protocol/openid-connect/certs';
const JWKS = createRemoteJWKSet(new URL(jwksUri));

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send('Token manquant');
    }
    
    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: 'https://192.168.1.24:8443/realms/ArchiManage'
    });
    
    req.user = payload;
    next();
  } catch (err) {
    console.error('Erreur de vérification du token:', err);
    res.status(403).send('Token invalide');
  }
};

module.exports = { protect };