/**
 * Notification API Service
 * 
 * Client for sending notifications to Zoho Cliq
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Send notification to Zoho Cliq
 * @param {Object} options - Notification options
 * @param {string} [options.webhookUrl] - Incoming webhook URL
 * @param {string} [options.channelId] - Channel ID (if using OAuth)
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} [options.type] - Notification type (success, error, warning, info, focus)
 * @param {Object} [options.metadata] - Additional metadata
 * @returns {Promise<Object>} Response data
 */
export async function sendCliqNotification(options) {
  const response = await api.post('/notify/cliq', options, {
    headers: {
      // Include auth token if available
      ...(localStorage.getItem('token') && {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    }
  });
  return response.data;
}

/**
 * Notification API
 */
export const notificationApi = {
  sendCliqNotification,
  
  /**
   * Quick notification helpers
   */
  success: (title, message, metadata) => 
    sendCliqNotification({ title, message, type: 'success', metadata }),
  
  error: (title, message, metadata) => 
    sendCliqNotification({ title, message, type: 'error', metadata }),
  
  warning: (title, message, metadata) => 
    sendCliqNotification({ title, message, type: 'warning', metadata }),
  
  info: (title, message, metadata) => 
    sendCliqNotification({ title, message, type: 'info', metadata }),
  
  focus: (title, message, metadata) => 
    sendCliqNotification({ title, message, type: 'focus', metadata }),
};

export default notificationApi;



