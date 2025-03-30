const axios = require("axios");
const logger = require("../utils/logger");

async function generateTTS(text) {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    return response.data;
  } catch (error) {
    logger.error(`TTS generation error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  generateTTS,
  initiateTTS: (medications) => {
    return `Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your ${medications.join(
      ", "
    )} today.`;
  },
};
