const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: createdAt, default: Date.now },
  password: { type: String, required: true },
  keycloakGroupId: { type: String, unique: true  }, 
  users: [
    {
      keycloakId: { type: String ,required: true} ,// Stocke l'ID Keycloak de l'utilisateur
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      joinedAt: { type: Date, default: Date.now }
    },
  ],
});

module.exports = mongoose.model("Company", companySchema);
