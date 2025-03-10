const mongoose = require("mongoose");

const TaskStatus = Object.freeze({
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
});

const TaskPriority = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
});

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: Object.values(TaskStatus), default: "PENDING" },
  priority: { type: String, enum: Object.values(TaskPriority), default: "MEDIUM" },
  phase: { type: mongoose.Schema.Types.ObjectId, ref: "Phase" },
  subTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});

Object.assign(taskSchema.statics, { TaskStatus, TaskPriority });

module.exports = mongoose.model("Task", taskSchema);
