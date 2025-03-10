const mongoose = require('mongoose');

const UserCompanySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
});

module.exports = mongoose.model('UserCompany', UserCompanySchema);