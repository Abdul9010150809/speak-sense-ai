const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  interviewerName: {
    type: String,
    default: "",
  },
  interviewerRole: {
    type: String,
    default: "",
  },
  interviewMode: {
    type: String,
    default: "Chat",
  },
  durationSeconds: {
    type: Number,
    default: 0,
  },
  questionsAnswered: {
    type: Number,
    default: 0,
  },
  industry: {
    type: String,
    default: "",
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  selections: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  report: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
