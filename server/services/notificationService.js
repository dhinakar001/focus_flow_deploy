/**
 * Notification Service
 * 
 * Handles sending notifications to Zoho Cliq via webhook URLs or OAuth tokens
 * 
 * @module services/notificationService
 */

const axios = require('axios');
const cliqApi = require('./cliqApi');
const logger = require('../utils/logger').child('NotificationService');

/**
 * Formats a message for Zoho Cliq
 * @private
 * @param {Object} options - Message options
 * @returns {Object} Formatted message payload
 */
function formatCliqMessage({ title, message, type = 'info', metadata = {} }) {
  const emojiMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    focus: '🎯'
  };

  const emoji = emojiMap[type] || emojiMap.info;
  const timestamp = new Date().toISOString();

  // Rich card format for better presentation
  return {
    card: {
      theme: 'modern',
      title: `${emoji} ${title || 'FocusFlow Notification'}`,
      sections: [
        {
          widgets: [
            {
              type: 'text',
              text: message || 'No message provided'
            }
          ]
        }
      ],
      metadata: {
        ...metadata,
        timestamp,
        source: 'FocusFlow'
      }
    }
  };
}

/**
 * Sends notification via incoming webhook URL
 * @param {Object} options - Notification options
 * @param {string} options.webhookUrl - Incoming webhook URL from Zoho Cliq
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} [options.type] - Notification type (success, error, warning, info, focus)
 * @param {Object} [options.metadata] - Additional metadata
 * @returns {Promise<Object>} Response data
 */
async function sendViaWebhook({ webhookUrl, title, message, type, metadata }) {
  if (!webhookUrl) {
    throw new Error('Webhook URL is required for webhook notifications');
  }

  if (!webhookUrl.startsWith('https://')) {
    throw new Error('Webhook URL must be a valid HTTPS URL');
  }

  try {
    const payload = formatCliqMessage({ title, message, type, metadata });

    logger.info('Sending notification via webhook', { 
      webhookUrl: webhookUrl.substring(0, 50) + '...', 
      type 
    });

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    logger.info('Webhook notification sent successfully', { 
      status: response.status 
    });

    return {
      success: true,
      method: 'webhook',
      status: response.status,
      data: response.data
    };
  } catch (error) {
    logger.error('Failed to send webhook notification', error, { 
      webhookUrl: webhookUrl.substring(0, 50) + '...' 
    });
    
    throw new Error(`Webhook notification failed: ${error.message}`);
  }
}

/**
 * Sends notification via OAuth token to a channel
 * @param {Object} options - Notification options
 * @param {string} options.accessToken - OAuth access token
 * @param {string} options.channelId - Target channel ID
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} [options.type] - Notification type
 * @param {Object} [options.metadata] - Additional metadata
 * @returns {Promise<Object>} Response data
 */
async function sendViaOAuth({ accessToken, channelId, title, message, type, metadata }) {
  if (!accessToken) {
    throw new Error('Access token is required for OAuth notifications');
  }

  if (!channelId) {
    throw new Error('Channel ID is required for OAuth notifications');
  }

  try {
    // Format message for Cliq API
    const formattedMessage = formatCliqMessage({ title, message, type, metadata });
    
    // Cliq API expects text or card format
    const textMessage = `${title || 'FocusFlow'}: ${message}`;

    logger.info('Sending notification via OAuth', { channelId, type });

    const result = await cliqApi.sendChannelMessage({
      accessToken,
      channelId,
      text: textMessage,
      // Note: Cliq API may support card format, adjust based on API version
    });

    logger.info('OAuth notification sent successfully', { channelId });

    return {
      success: true,
      method: 'oauth',
      channelId,
      data: result
    };
  } catch (error) {
    logger.error('Failed to send OAuth notification', error, { channelId });
    throw new Error(`OAuth notification failed: ${error.message}`);
  }
}

/**
 * Sends notification using available method (webhook or OAuth)
 * @param {Object} options - Notification options
 * @param {string} [options.webhookUrl] - Incoming webhook URL
 * @param {string} [options.accessToken] - OAuth access token
 * @param {string} [options.channelId] - Channel ID (for OAuth)
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} [options.type] - Notification type
 * @param {Object} [options.metadata] - Additional metadata
 * @returns {Promise<Object>} Response data
 */
async function sendNotification(options) {
  const { webhookUrl, accessToken, channelId, userId, title, message, type, metadata } = options;

  // Priority: webhookUrl > accessToken+channelId > userId lookup
  if (webhookUrl) {
    return sendViaWebhook({ webhookUrl, title, message, type, metadata });
  }

  if (accessToken && channelId) {
    return sendViaOAuth({ accessToken, channelId, title, message, type, metadata });
  }

  // Note: userId lookup for OAuth credentials would require cliqUserId mapping
  // For now, require explicit accessToken+channelId or webhookUrl
  throw new Error('Either webhookUrl, or (accessToken and channelId) must be provided');
}

module.exports = {
  sendNotification,
  sendViaWebhook,
  sendViaOAuth,
  formatCliqMessage
};

