const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  keycloakGroupId: { type: String, unique: true  }, 
  users: [
    {
      keycloakId: { type: String ,required: true} ,
      username: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      joinedAt: { type: Date, default: Date.now }
    },
  ],
});

module.exports = mongoose.model("Company", companySchema);
