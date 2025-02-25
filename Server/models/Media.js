const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const MediaSchema = new Schema({
    task: { type: Schema.Types.ObjectId, ref: "Task" },
    type: String,
    name: String,
    uploadedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Media", MediaSchema);