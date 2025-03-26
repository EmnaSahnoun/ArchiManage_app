const express = require("express");
const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} = require("../controllers/companyController");
const { keycloak } = require("../middlewares/authmiddleware");

const router = express.Router();

router.post("/", keycloak.protect(), createCompany);
router.get("/all", protect, getCompanies);
router.get("/:id", protect, getCompanyById);
router.put("/:id", protect, updateCompany);
router.delete("/:id", protect, deleteCompany);

module.exports = router;
