const { createRemoteJWKSet, jwtVerify } = require('jose');
const { URL } = require('url');
const keycloakConfig = require('./keycloak');
const JWKS = createRemoteJWKSet(new URL(`${keycloakConfig.authServerUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/certs`));

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token manquant' });
        }
        
        const token = authHeader.split(' ')[1];
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: `${keycloakConfig.authServerUrl}/realms/${keycloakConfig.realm}`,
            audience: keycloakConfig.clientId
        });
        
        req.user = {
            id: payload.sub,
            username: payload.preferred_username,
            email: payload.email,
            roles: payload.realm_access?.roles || [],
            groups: payload.groups || []
        };
        
        next();
    } catch (err) {
        console.error('Erreur de vérification du token:', err);
        res.status(403).json({ error: 'Token invalide', details: err.message });
    }
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user.roles.includes(role)) {
            return res.status(403).json({ error: `Accès refusé: rôle ${role} requis` });
        }
        next();
    };
};

module.exports = { protect, requireRole };