const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,required: true },
  address: {
    type: String,required: true, },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,required: true,}
});

module.exports = mongoose.model('Company', CompanySchema);
