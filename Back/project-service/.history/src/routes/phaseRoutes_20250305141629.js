const express = require("express");
const { createPhase, getPhases } = require("../controllers/phaseController");
const router = express.Router();

router.post('/', createPhase);
router.get('/:projectId', getPhases);
router.put('/:phaseId', updatePhase);
router.delete('/:phaseId', phaseController.deletePhase);


module.exports = router;
