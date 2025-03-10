const Company = require('../models/Company');
const UserCompany = require('../models/userCompany.model');

exports.createCompany = async (req, res) => {
    try {
        const { name } = req.body;
        const company = new Company({ name });
        await company.save();
        res.status(201).json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.assignUserToCompany = async (req, res) => {
    try {
        const { userId, companyId } = req.body;
        const userCompany = new UserCompany({ userId, companyId });
        await userCompany.save();
        res.status(201).json(userCompany);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
