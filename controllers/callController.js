const CallLog = require("../models/CallLog");
const Patient = require("../models/Patient");
const { makeCall } = require("../services/callService");
const { initiateTTS } = require("../services/ttsService");
const logger = require("../utils/logger");

async function initiateCall(req, res) {
  try {
    const { patientPhone } = req.body;

    // In a real system, you'd fetch the patient's medications from the database
    const medications = ["Aspirin", "Cardivol", "Metformin"];

    const callSid = await makeCall(patientPhone, medications);

    // Create a new call log
    const callLog = new CallLog({
      callSid,
      patientPhone,
      status: "initiated",
    });
    await callLog.save();

    res.status(200).json({
      success: true,
      message: "Call initiated successfully",
      callSid,
    });
  } catch (error) {
    logger.error(`Error initiating call: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to initiate call",
      error: error.message,
    });
  }
}

async function getCallLogs(req, res) {
  try {
    const logs = await CallLog.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    logger.error(`Error fetching call logs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch call logs",
    });
  }
}

module.exports = {
  initiateCall,
  getCallLogs,
};
