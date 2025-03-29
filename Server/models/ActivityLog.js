const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const ActivityLogSchema = new Schema({
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    task: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    media: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    activityType: String,
    timeStamp: Date
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);