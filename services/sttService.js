const axios = require("axios");
const logger = require("../utils/logger");

async function transcribeAudio(audioUrl) {
  try {
    const response = await axios.post(
      "https://api.deepgram.com/v1/listen",
      {
        url: audioUrl,
      },
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.results.channels[0].alternatives[0].transcript;
  } catch (error) {
    logger.error(`STT transcription error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  transcribeAudio,
};
