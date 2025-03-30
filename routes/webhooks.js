const express = require("express");
const router = express.Router();
const { handleCallStatus } = require("../services/callService");
const { transcribeAudio } = require("../services/sttService");
const CallLog = require("../models/CallLog");
const logger = require("../utils/logger");
const twilio = require("twilio");
const { initiateTTS } = require("../services/ttsService");

// Twilio webhook for call initiation
router.post("/initiate-call", (req, res) => {
  const response = new twilio.twiml.VoiceResponse();
  if (req.query.AnsweredBy === "machine") {
    response.say(
      "We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so."
    );
    response.hangup();
  } else {
    const medications = ["Aspirin", "Cardivol", "Metformin"];
    const message = initiateTTS(medications);
    response.say(message);
    response.gather({
      input: "speech",
      action: "/api/webhooks/handle-response",
      method: "POST",
      speechTimeout: "auto",
    });
  }
  res.type("text/xml");
  res.send(response.toString());
});

// Handle patient response
router.post("/handle-response", async (req, res) => {
  const response = new twilio.twiml.VoiceResponse();
  const callSid = req.body.CallSid;
  const speechResult = req.body.SpeechResult;

  try {
    // Update call log with patient response
    await CallLog.findOneAndUpdate(
      { callSid },
      {
        status: "answered",
        patientResponse: speechResult,
      }
    );

    logger.info(`Patient response for call ${callSid}: ${speechResult}`);
    response.say("Thank you for your response. Have a nice day!");
    response.hangup();
  } catch (error) {
    logger.error(`Error handling response: ${error.message}`);
    response.say(
      "We encountered an error processing your response. Please try again later."
    );
    response.hangup();
  }

  res.type("text/xml");
  res.send(response.toString());
});

// Handle call status updates
router.post("/call-status", async (req, res) => {
  const callSid = req.body.CallSid;
  const callStatus = req.body.CallStatus;
  const recordingUrl = req.body.RecordingUrl || null;

  try {
    await handleCallStatus(callSid, callStatus, recordingUrl);

    // Handle unanswered calls (no answer, busy, failed)
    if (["no-answer", "busy", "failed"].includes(callStatus)) {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      try {
        // First try to leave a voicemail
        await client.calls(callSid).update({
          url: `${process.env.NGROK_URL}/api/webhooks/voicemail`,
        });
      } catch (voicemailError) {
        logger.warn(
          `Could not leave voicemail, sending SMS instead: ${voicemailError.message}`
        );

        // If voicemail fails, send SMS
        const patientPhone = req.body.To;
        await client.messages.create({
          body: "We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so.",
          from: process.env.TWILIO_PHONE_NUMBER,
          to: patientPhone,
        });

        await handleCallStatus(callSid, "sms_sent");
      }
    }
  } catch (error) {
    logger.error(`Error handling call status: ${error.message}`);
  }

  res.status(200).end();
});

// Voicemail handler
router.post("/voicemail", (req, res) => {
  const response = new twilio.twiml.VoiceResponse();
  if (req.query.AnsweredBy === "machine") {
    response.say(
      "We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so."
    );
    response.hangup();
  } else {
    response.say(
      "Sorry, we were trying to leave a message but you picked up. Please call us back."
    );
    response.hangup();
  }
  res.send(response.toString());
});

// Handle patient-initiated calls
router.post("/patient-callback", (req, res) => {
  const response = new twilio.twiml.VoiceResponse();
  const medications = ["Aspirin", "Cardivol", "Metformin"];
  const message = initiateTTS(medications);

  response.say(message);
  response.gather({
    input: "speech",
    action: "/api/webhooks/handle-response",
    method: "POST",
    speechTimeout: "auto",
  });

  res.type("text/xml");
  res.send(response.toString());
});

module.exports = router;
