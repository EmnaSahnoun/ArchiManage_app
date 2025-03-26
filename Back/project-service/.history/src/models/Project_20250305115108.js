const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String},
  phases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Phase" }],
});

module.exports = mongoose.model("Project", projectSchema);
