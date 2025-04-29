const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uploadedDate: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  pinned: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  permissions: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      access: {
        type: String,
        enum: ["view", "edit", "admin"],
        default: "view",
      },
    },
  ],
  versions: [
    {
      filePath: String,
      fileSize: Number,
      uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      uploadedDate: {
        type: Date,
        default: Date.now,
      },
      comment: String,
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("Document", DocumentSchema);
