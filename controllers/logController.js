// controllers/logController.js
const CallLog = require("../models/CallLog");
const logger = require("../utils/logger");
const { formatPhoneNumber } = require("../config/twilio");

/**
 * @class LogController
 * @description Handles all call log related operations
 */
class LogController {
  /**
   * @method getCallLogs
   * @description Get all call logs with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCallLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        phoneNumber,
        startDate,
        endDate,
      } = req.query;

      // Build query filters
      const filters = {};
      if (status) filters.status = status;
      if (phoneNumber) {
        const formattedNumber = formatPhoneNumber(phoneNumber);
        if (formattedNumber) filters.patientPhone = formattedNumber;
      }
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate);
        if (endDate) filters.createdAt.$lte = new Date(endDate);
      }

      // Execute query with pagination
      const logs = await CallLog.find(filters)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      // Get total count for pagination info
      const count = await CallLog.countDocuments(filters);

      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          pageSize: limit,
        },
      });
    } catch (error) {
      logger.error(`Failed to fetch call logs: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to fetch call logs",
        error: error.message,
      });
    }
  }

  /**
   * @method getCallLogById
   * @description Get a single call log by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCallLogById(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid call log ID",
        });
      }
      const log = await CallLog.findById(req.params.id);
      if (!log) {
        return res.status(404).json({
          success: false,
          message: "Call log not found",
        });
      }
      res.status(200).json({
        success: true,
        data: log,
      });
    } catch (error) {
      logger.error(`Failed to fetch call log: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to fetch call log",
        error: error.message,
      });
    }
  }

  /**
   * @method searchCallLogs
   * @description Search call logs by patient response text
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchCallLogs(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const logs = await CallLog.find(
        {
          $text: { $search: query },
        },
        {
          score: { $meta: "textScore" },
        }
      ).sort({
        score: { $meta: "textScore" },
      });

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      logger.error(`Failed to search call logs: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to search call logs",
        error: error.message,
      });
    }
  }

  /**
   * @method getCallStatistics
   * @description Get statistics about call logs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCallStatistics(req, res) {
    try {
      const stats = await CallLog.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            lastCall: { $max: "$createdAt" },
          },
        },
        {
          $project: {
            status: "$_id",
            count: 1,
            lastCall: 1,
            _id: 0,
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      const totalCalls = stats.reduce((sum, stat) => sum + stat.count, 0);

      res.status(200).json({
        success: true,
        data: {
          stats,
          totalCalls,
        },
      });
    } catch (error) {
      logger.error(`Failed to get call statistics: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to get call statistics",
        error: error.message,
      });
    }
  }

  /**
   * @method exportCallLogs
   * @description Export call logs to CSV
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async exportCallLogs(req, res) {
    try {
      const logs = await CallLog.find().sort({ createdAt: -1 });
      console.log("logs::: ", logs);
      // Convert to CSV
      let csv = "Call SID,Patient Phone,Status,Response,Recording URL,Date\n";
      logs.forEach((log) => {
        csv += `"${log.callSid}","${log.patientPhone}","${log.status}","${
          log.patientResponse || ""
        }","${log.recordingUrl || ""}","${log.createdAt.toISOString()}"\n`;
      });

      // Set headers for file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=call_logs.csv"
      );
      res.status(200).send(csv);
    } catch (error) {
      logger.error(`Failed to export call logs: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to export call logs",
        error: error.message,
      });
    }
  }
}

module.exports = new LogController();
