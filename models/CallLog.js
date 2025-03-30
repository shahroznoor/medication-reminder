const mongoose = require("mongoose");

const CallLogSchema = new mongoose.Schema({
  callSid: {
    type: String,
    required: true,
    unique: true,
  },
  patientPhone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["initiated", "answered", "voicemail", "sms_sent", "failed"],
    required: true,
  },
  patientResponse: String,
  recordingUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CallLog", CallLogSchema);
