const Project = require("../models/Project");

exports.createProject = async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate("phases");
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProjectById = async (req, res) => {
    try {
      const { projectId } = req.params;  
      const project = await Project.findById(projectId).populate("phases");
  
      // Vérifier si le projet existe
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      // Retourner le projet avec les phases
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  