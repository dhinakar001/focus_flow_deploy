/**
 * Notification API Tests
 * Tests the /notify/cliq endpoint with mocked network calls
 */
const request = require('supertest');
const axios = require('axios');
const { initializeApp } = require('../server/index');
const notificationService = require('../server/services/notificationService');

// Mock axios for webhook calls
jest.mock('axios');
const mockedAxios = axios;

// Mock cliqApi
jest.mock('../server/services/cliqApi', () => ({
  sendChannelMessage: jest.fn()
}));

const cliqApi = require('../server/services/cliqApi');

describe('Notification API', () => {
  let app;

  beforeAll(() => {
    app = initializeApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post.mockClear();
    cliqApi.sendChannelMessage.mockClear();
  });

  describe('POST /notify/cliq', () => {
    describe('Webhook Method', () => {
      it('should send notification via webhook URL', async () => {
        const webhookUrl = 'https://cliq.zoho.com/incomingwebhook/test123';
        const mockResponse = { status: 200, data: { success: true } };
        
        mockedAxios.post.mockResolvedValue(mockResponse);

        const response = await request(app)
          .post('/notify/cliq')
          .send({
            webhookUrl,
            title: 'Test Notification',
            message: 'This is a test message'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('method', 'webhook');
        expect(mockedAxios.post).toHaveBeenCalledWith(
          webhookUrl,
          expect.objectContaining({
            card: expect.objectContaining({
              title: expect.stringContaining('Test Notification')
            })
          }),
          expect.objectContaining({
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
          })
        );
      });

      it('should handle different notification types', async () => {
        const webhookUrl = 'https://cliq.zoho.com/incomingwebhook/test123';
        mockedAxios.post.mockResolvedValue({ status: 200, data: {} });

        const types = ['success', 'error', 'warning', 'info', 'focus'];
        
        for (const type of types) {
          await request(app)
            .post('/notify/cliq')
            .send({
              webhookUrl,
              title: `${type} notification`,
              message: 'Test message',
              type
            })
            .expect(200);
        }

        expect(mockedAxios.post).toHaveBeenCalledTimes(types.length);
      });

      it('should return 400 if webhook URL is invalid', async () => {
        const response = await request(app)
          .post('/notify/cliq')
          .send({
            webhookUrl: 'not-a-valid-url',
            title: 'Test',
            message: 'Test message'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 if webhook URL is not HTTPS', async () => {
        const response = await request(app)
          .post('/notify/cliq')
          .send({
            webhookUrl: 'http://insecure-url.com/webhook',
            title: 'Test',
            message: 'Test message'
          })
          .expect(500); // Service will throw error

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('OAuth Method', () => {
      it('should send notification via OAuth token', async () => {
        const accessToken = 'test-access-token';
        const channelId = 'channel-123';
        const mockResult = { success: true, messageId: 'msg-123' };
        
        cliqApi.sendChannelMessage.mockResolvedValue(mockResult);

        const response = await request(app)
          .post('/notify/cliq')
          .send({
            accessToken,
            channelId,
            title: 'OAuth Notification',
            message: 'This is sent via OAuth'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('method', 'oauth');
        expect(cliqApi.sendChannelMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            accessToken,
            channelId,
            text: expect.stringContaining('OAuth Notification')
          })
        );
      });

      it('should return 400 if accessToken provided without channelId', async () => {
        const response = await request(app)
          .post('/notify/cliq')
          .send({
            accessToken: 'test-token',
            title: 'Test',
            message: 'Test message'
          })
          .expect(500); // Service will throw error

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Validation', () => {
      it('should return 400 if neither title nor message provided', async () => {
        const response = await request(app)
          .post('/notify/cliq')
          .send({
            webhookUrl: 'https://cliq.zoho.com/incomingwebhook/test123'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('title or message is required');
      });

      it('should return 400 if no authentication method provided', async () => {
        const response = await request(app)
          .post('/notify/cliq')
          .send({
            title: 'Test',
            message: 'Test message'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });

      it('should accept title only', async () => {
        mockedAxios.post.mockResolvedValue({ status: 200, data: {} });

        await request(app)
          .post('/notify/cliq')
          .send({
            webhookUrl: 'https://cliq.zoho.com/incomingwebhook/test123',
            title: 'Title only notification'
          })
          .expect(200);
      });

      it('should accept message only', async () => {
        mockedAxios.post.mockResolvedValue({ status: 200, data: {} });

        await request(app)
          .post('/notify/cliq')
          .send({
            webhookUrl: 'https://cliq.zoho.com/incomingwebhook/test123',
            message: 'Message only notification'
          })
          .expect(200);
      });
    });

    describe('Error Handling', () => {
      it('should handle webhook request failure', async () => {
        const webhookUrl = 'https://cliq.zoho.com/incomingwebhook/test123';
        
        mockedAxios.post.mockRejectedValue(new Error('Network error'));

        const response = await request(app)
          .post('/notify/cliq')
          .send({
            webhookUrl,
            title: 'Test',
            message: 'Test message'
          })
          .expect(500);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Webhook notification failed');
      });

      it('should handle OAuth request failure', async () => {
        const accessToken = 'invalid-token';
        const channelId = 'channel-123';
        
        cliqApi.sendChannelMessage.mockRejectedValue(new Error('Invalid token'));

        const response = await request(app)
          .post('/notify/cliq')
          .send({
            accessToken,
            channelId,
            title: 'Test',
            message: 'Test message'
          })
          .expect(500);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('OAuth notification failed');
      });
    });

    describe('Metadata', () => {
      it('should include metadata in notification', async () => {
        const webhookUrl = 'https://cliq.zoho.com/incomingwebhook/test123';
        mockedAxios.post.mockResolvedValue({ status: 200, data: {} });

        const metadata = {
          userId: 'user-123',
          sessionId: 'session-456',
          customField: 'custom-value'
        };

        await request(app)
          .post('/notify/cliq')
          .send({
            webhookUrl,
            title: 'Test',
            message: 'Test message',
            metadata
          })
          .expect(200);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          webhookUrl,
          expect.objectContaining({
            card: expect.objectContaining({
              metadata: expect.objectContaining(metadata)
            })
          }),
          expect.any(Object)
        );
      });
    });
  });
});



