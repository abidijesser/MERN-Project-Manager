const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskStatusEnum = ["ToDo", "InProgress", "Testing", "Done"];
const TaskPriorityEnum = ["Low", "Medium", "High"];

const TaskSchema = new Schema({
    title: String,
    description: String,
    status: { type: String, enum: TaskStatusEnum, default: "ToDo" },
    priority: { type: String, enum: TaskPriorityEnum, default: "null" },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
    media: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    startDate: { type: Date, default: Date.now },
    endDate: Date
});
module.exports = mongoose.model("Task", TaskSchema);