const express = require("express");
const { createProject, getProjects } = require("../controllers/phaseController");
const router = express.Router();

router.post('/phases', phaseController.createPhase);
router.get('/phases/:projectId', phaseController.getPhases);
router.put('/phases/:phaseId', phaseController.updatePhase);
router.delete('/phases/:phaseId', phaseController.deletePhase);


module.exports = router;
