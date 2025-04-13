/* const Keycloak = require('keycloak-connect');
const session = require('express-session');

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });

module.exports = keycloak;
 */
module.exports = {
    authServerUrl: process.env.KEYCLOAK_URL,
    realm: process.env.KEYCLOAK_REALM,
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    adminUser: process.env.KEYCLOAK_ADMIN_USER,
    adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD
};