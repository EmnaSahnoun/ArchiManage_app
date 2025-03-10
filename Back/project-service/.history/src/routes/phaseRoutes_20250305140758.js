const express = require("express");
const { createProject, getProjects } = require("../controllers/phaseController");
const router = express.Router();

router.post('/create', phaseController.createPhase);
router.get('/:projectId', phaseController.getPhases);
router.put('/:phaseId', phaseController.updatePhase);
router.delete('/phases/:phaseId', phaseController.deletePhase);


module.exports = router;
