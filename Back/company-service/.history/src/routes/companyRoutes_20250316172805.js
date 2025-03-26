const express = require("express");
const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} = require("../controllers/companyController");
const { protect } = require("../middlewares/authmiddleware");

const router = express.Router();

router.post("/", protect, createCompany);
router.get("/all", protect, getCompanies);
router.get("/:id", protect, getCompanyById);
router.put("/:id", protect, updateCompany);
router.delete("/:id", protect, deleteCompany);
router.get("/users",protect,getUsers)
module.exports = router;
