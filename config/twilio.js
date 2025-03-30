// config/twilio.js
const twilio = require("twilio");
const logger = require("../utils/logger");

// Initialize Twilio client with environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Validate required configuration
if (!accountSid || !authToken || !phoneNumber) {
  const errorMessage =
    "Twilio configuration is incomplete. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your environment variables.";
  logger.error(errorMessage);
  throw new Error(errorMessage);
}

// Create and configure Twilio client
const client = twilio(accountSid, authToken);

// Twilio utility functions
const twilioConfig = {
  /**
   * Get the configured Twilio client
   * @returns {twilio.Twilio} The Twilio client instance
   */
  getClient: () => client,

  /**
   * Get the configured Twilio phone number
   * @returns {string} The Twilio phone number
   */
  getPhoneNumber: () => phoneNumber,

  /**
   * Validate a phone number format
   * @param {string} phoneNumber - The phone number to validate
   * @returns {boolean} True if valid, false otherwise
   */
  validatePhoneNumber: (phoneNumber) => {
    // Simple E.164 format validation
    return /^\+[1-9]\d{1,14}$/.test(phoneNumber);
  },

  /**
   * Format phone number to E.164 standard
   * @param {string} phoneNumber - The phone number to format
   * @returns {string|null} Formatted number or null if invalid
   */
  formatPhoneNumber: (phoneNumber) => {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, "");

    // US/Canada numbers (add +1 if 10 digits)
    if (digits.length === 10) {
      return `+1${digits}`;
    }

    // International numbers starting with country code
    if (digits.length > 10 && digits.length <= 15) {
      return `+${digits}`;
    }

    return null;
  },

  /**
   * Verify if the number can receive SMS
   * @param {string} phoneNumber - The phone number to check
   * @returns {Promise<boolean>} True if SMS-capable
   */
  verifySmsCapability: async (phoneNumber) => {
    try {
      const number = await client.lookups.v2.phoneNumbers(phoneNumber).fetch();
      return number.valid && number.carrier?.type === "mobile";
    } catch (error) {
      logger.error(`SMS capability check failed: ${error.message}`);
      return false;
    }
  },
};

module.exports = twilioConfig;
