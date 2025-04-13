const express = require("express");
const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getUsers,
  addUserToCompany
} = require("../controllers/companyController");
const { protect, requireRole } = require("../middlewares/authmiddleware");

const router = express.Router();

router.post("/create", protect, requireRole('ADMIN'), createCompany);
router.get("/all", protect, getCompanies);
router.get("/:id", protect, getCompanyById);
router.put("/:id", protect, updateCompany);
router.delete("/:id", protect, requireRole('ADMIN'), deleteCompany);
router.get("/users",protect, getUsers);
router.post("/:companyId/users", protect, addUserToCompany);
module.exports = router;
