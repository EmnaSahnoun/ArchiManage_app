const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  password: { type: String, required: true },
  keycloakGroupId: { type: String }, 
  users: [
    {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
  ],
});

module.exports = mongoose.model("Company", companySchema);
