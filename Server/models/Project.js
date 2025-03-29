const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectStatusEnum = ["Active", "Completed", "Archived"];

const ProjectSchema = new Schema({
    projectName: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ProjectStatusEnum, default: "Active" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: [{ type: String }] // Nouveau champ pour les commentaires
});
module.exports = mongoose.model("Project", ProjectSchema);