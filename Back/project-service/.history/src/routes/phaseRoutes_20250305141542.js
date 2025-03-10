const express = require("express");
const { phaseController } = require("../controllers/phaseController");
const router = express.Router();

router.post('/', phaseController.createPhase);
router.get('/:projectId', phaseController.getPhases);
router.put('/:phaseId', phaseController.updatePhase);
router.delete('/:phaseId', phaseController.deletePhase);


module.exports = router;
