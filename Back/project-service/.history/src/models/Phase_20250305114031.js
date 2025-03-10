const mongoose = require("mongoose");

const phaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: Date,
  endDate: Date,
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});

module.exports = mongoose.model("Phase", phaseSchema);
