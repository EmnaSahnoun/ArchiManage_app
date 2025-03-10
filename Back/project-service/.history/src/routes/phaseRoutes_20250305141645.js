const express = require("express");
const { createPhase, getPhases , updatePhase } = require("../controllers/phaseController");
const router = express.Router();

router.post('/', createPhase);
router.get('/:projectId', getPhases);
router.put('/:phaseId', updatePhase);
router.delete('/:phaseId', deletePhase);


module.exports = router;
