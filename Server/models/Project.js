const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectStatusEnum = ["Active", "Completed", "Archived"];

const ProjectSchema = new Schema({
    projectName: String,
    description: String,
    status: { type: String, enum: ProjectStatusEnum, default: "Active" },
    startDate: Date,
    endDate: Date,
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    owner: { type: Schema.Types.ObjectId, ref: "User" }
});
module.exports = mongoose.model("Project", ProjectSchema);