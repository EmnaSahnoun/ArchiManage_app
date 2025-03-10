const Task = require('../models/Task'); // Le modèle Task
const Phase = require('../models/Phase'); // Le modèle Phase

exports.createTask = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, priority, phaseId } = req.body;

    const phase = await Phase.findById(phaseId);
    if (!phase) {
      return res.status(404).json({ message: "Phase not found" });
    }
 
    const task = new Task({
      name,
      description,
      startDate,
      endDate,
      status,
      priority,
      phase: phaseId,
    });

    await task.save();

    phase.tasks.push(task._id);
    await phase.save();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { phaseId } = req.params;

    const phase = await Phase.findById(phaseId).populate('tasks');
    if (!phase) {
      return res.status(404).json({ message: "Phase not found" });
    }

    res.status(200).json(phase.tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une tâche
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { name, description, startDate, endDate, status, priority } = req.body;

    const task = await Task.findByIdAndUpdate(taskId, {
      name,
      description,
      startDate,
      endDate,
      status,
      priority,
    }, { new: true });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une tâche
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Supprimer la tâche de la phase
    await Phase.updateOne({ _id: task.phase }, { $pull: { tasks: taskId } });

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
