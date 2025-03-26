const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String},
  createdAt: { type: Date, default: Date.now }
  phases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Phase" }],
});

module.exports = mongoose.model("Project", projectSchema);
