const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MeetingSchema = new Schema({
  title: {
    type: String,
    default: "Réunion",
  },
  date: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  participants: [{
    type: String,
    required: true,
  }],
  meetingLink: {
    type: String,
    required: true,
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  googleCalendarEventId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index pour des recherches plus rapides
MeetingSchema.index({ date: 1 });
MeetingSchema.index({ organizer: 1 });

module.exports = mongoose.model("Meeting", MeetingSchema);
