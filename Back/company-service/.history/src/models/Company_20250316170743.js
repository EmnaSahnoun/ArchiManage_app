const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  ownerId: { type: String, required: true }, // Lien avec l'utilisateur Keycloak
  createdAt: { type: Date, default: Date.now },
  users: [
    {
        userId: { type: String, required: true },
        role: { type: String, enum: ["Admin", "Architect", "Member"] }
    }
]
});

module.exports = mongoose.model("Company", companySchema);
