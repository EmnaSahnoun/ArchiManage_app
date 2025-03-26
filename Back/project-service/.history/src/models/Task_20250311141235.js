const mongoose = require("mongoose");

const TaskStatus = Object.freeze({
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELED: "CANCELED",
});

const TaskPriority = Object.freeze({
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
});

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: Object.values(TaskStatus), default: "PENDING" },
    priority: { type: String, enum: Object.values(TaskPriority), default: "MEDIUM" },
    phase: { type: mongoose.Schema.Types.ObjectId, ref: "Phase", required: true },
    subTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }]
});

module.exports = mongoose.model("Task", taskSchema);
