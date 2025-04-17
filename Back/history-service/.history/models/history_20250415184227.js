const mongoose = require('mongoose');

const historyEventSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  eventType: { 
    type: String, 
    required: true,
    enum: ['COMMENT_ADD', 'COMMENT_UPDATE', 'COMMENT_DELETE', 
           'MEDIA_UPLOAD', 'MEDIA_DELETE',
           'TASK_UPDATE', 'TASK_STATUS_CHANGE']
  },
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('History', historyEventSchema);