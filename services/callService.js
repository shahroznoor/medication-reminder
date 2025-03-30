const twilio = require("twilio");
const CallLog = require("../models/CallLog");
const logger = require("../utils/logger");
const { initiateTTS } = require("./ttsService");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function makeCall(patientPhone, medications) {
  try {
    const call = await client.calls.create({
      url: `${process.env.NGROK_URL}/api/webhooks/initiate-call`,
      to: patientPhone,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.NGROK_URL}/api/webhooks/call-status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    });

    logger.info(`Call initiated to ${patientPhone}, SID: ${call.sid}`);
    return call.sid;
  } catch (error) {
    logger.error(`Error making call: ${error.message}`);
    throw error;
  }
}

async function handleCallStatus(callSid, status, recordingUrl = null) {
  try {
    const callLog = await CallLog.findOneAndUpdate(
      { callSid },
      { status, recordingUrl },
      { new: true }
    );

    if (callLog) {
      logger.info(`Call ${callSid} status updated to ${status}`);
    }
  } catch (error) {
    logger.error(`Error updating call status: ${error.message}`);
  }
}

module.exports = {
  makeCall,
  handleCallStatus,
};
