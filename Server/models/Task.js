const mongoose = require("mongoose");
const Schema = mongoose.Schema;

<<<<<<< HEAD
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
=======
const TaskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["To Do", "In Progress", "Done"],
    default: "To Do",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  dueDate: {
    type: Date,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Task", TaskSchema);
>>>>>>> cherif2
