const Keycloak = require("keycloak-connect");
const session = require("express-session");

const keycloak = new Keycloak({ store: new session.MemoryStore() });

const protect = (req, res, next) => {
  keycloak.protect()(req, res, next);
};

module.exports = { keycloak, protect };
