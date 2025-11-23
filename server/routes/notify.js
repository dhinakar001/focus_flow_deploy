/**
 * Notification Routes
 * 
 * Routes for sending notifications to Zoho Cliq
 * 
 * @module routes/notify
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { optionalAuth } = require('../middlewares/authMiddleware');
const { validate, body } = require('../middlewares/inputValidation');

/**
 * POST /notify/cliq
 * Send notification to Zoho Cliq
 * 
 * Authentication: Optional
 * 
 * Body:
 * - webhookUrl (string, optional): Incoming webhook URL
 * - accessToken (string, optional): OAuth access token
 * - channelId (string, optional): Channel ID for OAuth
 * - title (string, required if message not provided): Notification title
 * - message (string, required if title not provided): Notification message
 * - type (string, optional): Notification type (success, error, warning, info, focus)
 * - metadata (object, optional): Additional metadata
 */
router.post(
  '/cliq',
  optionalAuth, // Optional auth - webhook doesn't need auth
  validate([
    body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('message').optional().isString().trim().isLength({ min: 1, max: 2000 }),
    body('webhookUrl').optional().isURL(),
    body('accessToken').optional().isString(),
    body('channelId').optional().isString(),
    body('type').optional().isIn(['success', 'error', 'warning', 'info', 'focus']),
    body('metadata').optional().isObject()
  ]),
  notificationController.sendCliqNotification
);

module.exports = router;

