const mongoose = require("mongoose");

const phaseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});

module.exports = mongoose.model("Phase", phaseSchema);
