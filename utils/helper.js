// utils/helpers.js
const logger = require("./logger");
const { formatPhoneNumber } = require("../config/twilio");

/**
 * Utility functions for common operations
 */
module.exports = {
  /**
   * Format a date to human-readable string
   * @param {Date} date - Date object to format
   * @param {boolean} [withTime=true] - Include time in output
   * @returns {string} Formatted date string
   */
  formatDate: (date, withTime = true) => {
    try {
      if (!date) return "N/A";

      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      if (withTime) {
        options.hour = "2-digit";
        options.minute = "2-digit";
        options.second = "2-digit";
      }

      return new Date(date).toLocaleDateString("en-US", options);
    } catch (error) {
      logger.error(`Date formatting error: ${error.message}`);
      return "Invalid Date";
    }
  },

  /**
   * Validate and format a phone number
   * @param {string} phoneNumber - Phone number to validate
   * @returns {string|null} Formatted number or null if invalid
   */
  validateAndFormatPhone: (phoneNumber) => {
    if (!phoneNumber) return null;

    // First try to format using Twilio's utility
    const formatted = formatPhoneNumber(phoneNumber);
    if (formatted) return formatted;

    // Fallback basic validation
    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length >= 10) {
      return `+${digits}`;
    }

    return null;
  },

  /**
   * Generate a random alphanumeric ID
   * @param {number} [length=12] - Length of the ID
   * @returns {string} Generated ID
   */
  generateId: (length = 12) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Parse error object and return user-friendly message
   * @param {Error|any} error - Error object
   * @returns {string} Friendly error message
   */
  getErrorMessage: (error) => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "An unknown error occurred";
  },

  /**
   * Delay execution for specified milliseconds
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  sleep: (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Convert object to query string
   * @param {Object} params - Object to convert
   * @returns {string} Query string
   */
  toQueryString: (params) => {
    return Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
  },

  /**
   * Remove undefined/null fields from an object
   * @param {Object} obj - Object to clean
   * @returns {Object} Cleaned object
   */
  cleanObject: (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});
  },

  /**
   * Capitalize the first letter of each word in a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize: (str) => {
    if (!str) return "";
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  },

  /**
   * Validate email address format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  isValidEmail: (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncate: (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  },

  /**
   * Convert seconds to HH:MM:SS format
   * @param {number} seconds - Total seconds
   * @returns {string} Formatted time
   */
  secondsToTime: (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    return [h, m, s]
      .map((v) => (v < 10 ? `0${v}` : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  },

  /**
   * Generate a hash code from string (simple implementation)
   * @param {string} str - Input string
   * @returns {number} Hash code
   */
  hashCode: (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },
};
