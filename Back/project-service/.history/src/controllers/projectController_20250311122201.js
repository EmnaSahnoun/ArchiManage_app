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
exports