const Task = require('../models/Task'); 
const Phase = require('../models/Phase'); 

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
exports.createsubTask = async (req, res) => {
    try {
      const { name, description, startDate, endDate, status, priority, taskId } = req.body;
  
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
   
      const subtask = new Task({
        name,
        description,
        startDate,
        endDate,
        status,
        priority,
        phase: task.phase,
      });
  
      await subtask.save();
  
      task.subTasks.push(subtask._id);
      await task.save();
  
      res.status(201).json(subtask);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  exports.getTaskById = async (req, res) => {
    try {
      const { taskId } = req.params;
  
      const task = await Task.findById(task).populate('tasks');
      if (!phase) {
        return res.status(404).json({ message: "Phase not found" });
      }
  
      res.status(200).json(phase.tasks);
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

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Phase.updateOne({ _id: task.phase }, { $pull: { tasks: taskId } });

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
