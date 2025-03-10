const Phase = require('../models/Phase'); 
const Project = require('../models/Project'); 

exports.createPhase = async (req, res) => {
  try {
    const { name, description, startDate, endDate, projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const phase = new Phase({
      name,
      description,
      startDate,
      endDate,
      project: projectId,
    });
    await phase.save();

    // Ajouter la phase au projet
    project.phases.push(phase._id);
    await project.save();

    res.status(201).json(phase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer toutes les phases d'un projet
exports.getPhases = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Vérifier si le projet existe
    const project = await Project.findById(projectId).populate('phases');
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project.phases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une phase
exports.updatePhase = async (req, res) => {
  try {
    const { phaseId } = req.params;
    const { name, description, startDate, endDate } = req.body;

    const phase = await Phase.findByIdAndUpdate(phaseId, {
      name,
      description,
      startDate,
      endDate,
    }, { new: true });

    if (!phase) {
      return res.status(404).json({ message: "Phase not found" });
    }

    res.status(200).json(phase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une phase
exports.deletePhase = async (req, res) => {
  try {
    const { phaseId } = req.params;

    const phase = await Phase.findByIdAndDelete(phaseId);
    if (!phase) {
      return res.status(404).json({ message: "Phase not found" });
    }

    // Supprimer la phase du projet
    await Project.updateOne({ _id: phase.project }, { $pull: { phases: phaseId } });

    res.status(200).json({ message: "Phase deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
