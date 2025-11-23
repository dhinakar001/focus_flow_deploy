/**
 * Notification Controller
 * 
 * Handles notification requests to Zoho Cliq
 * 
 * @module controllers/notificationController
 */

const notificationService = require('../services/notificationService');
const { authenticate } = require('../middlewares/authMiddleware');
const logger = require('../utils/logger').child('NotificationController');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Send notification to Zoho Cliq
 * POST /notify/cliq
 * 
 * @param {Object} req - Express request
 * @param {Object} req.body - Request body
 * @param {string} [req.body.webhookUrl] - Incoming webhook URL
 * @param {string} [req.body.accessToken] - OAuth access token
 * @param {string} [req.body.channelId] - Channel ID (for OAuth)
 * @param {string} req.body.title - Notification title
 * @param {string} req.body.message - Notification message
 * @param {string} [req.body.type] - Notification type (success, error, warning, info, focus)
 * @param {Object} [req.body.metadata] - Additional metadata
 * @param {Object} res - Express response
 */
const sendCliqNotification = asyncHandler(async (req, res) => {
  const { webhookUrl, accessToken, channelId, title, message, type, metadata } = req.body;

  // Validate required fields
  if (!title && !message) {
    return res.status(400).json({
      success: false,
      error: 'Either title or message is required'
    });
  }

  // Validate at least one authentication method
  if (!webhookUrl && !(accessToken && channelId)) {
    return res.status(400).json({
      success: false,
      error: 'Either webhookUrl, or (accessToken and channelId) is required'
    });
  }

  try {
    const result = await notificationService.sendNotification({
      webhookUrl,
      accessToken,
      channelId,
      title,
      message,
      type: type || 'info',
      metadata: {
        ...metadata,
        userId: req.user?.userId,
        timestamp: new Date().toISOString()
      }
    });

    logger.info('Notification sent successfully', {
      method: result.method,
      userId: req.user?.userId
    });

    return res.json({
      success: true,
      message: 'Notification sent successfully',
      data: result
    });
  } catch (error) {
    logger.error('Failed to send notification', error, {
      userId: req.user?.userId
    });

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send notification'
    });
  }
});

module.exports = {
  sendCliqNotification
};

