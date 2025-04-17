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