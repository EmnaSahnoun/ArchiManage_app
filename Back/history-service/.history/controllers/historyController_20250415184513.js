const HistoryEvent = require('../models/history');

exports.recordEvent = async (taskId, eventType, userId, metadata = {}) => {
  try {
    const event = new HistoryEvent({
      taskId,
      eventType,
      userId,
      metadata
    });
    await event.save();
    return event;
  } catch (error) {
    console.error('Error recording history event:', error);
    throw error;
  }
};

exports.getTaskHistory = async (req, res) => {
  try {
    const { taskId } = req.params;
    const events = await HistoryEvent.find({ taskId })
      .sort({ timestamp: -1 })
      .limit(50);
      
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateTask = async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      // Enregistrement de l'événement
      await recordEvent(
        task._id,
        'TASK_UPDATE',
        req.user.id, // Supposons que l'utilisateur est disponible
        {
          changes: req.body,
          previousState: req.body.previousState // À capturer avant la modification
        }
      );
      
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };