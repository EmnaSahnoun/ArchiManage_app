const Keycloak = require("keycloak-connect");
const session = require("express-session");

const keycloakConfig = {
  clientId: "company-service",
  bearerOnly: true,
  serverUrl: "https://localhost:8443/auth",
  realm: "ArchiManage",
  credentials: {
    secret: "your-client-secret",
  },
};

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

const protect = keycloak.protect();

module.exports = { keycloak, protect };
