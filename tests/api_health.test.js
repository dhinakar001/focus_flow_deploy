/**
 * Health Check API Tests
 * Tests the /health endpoint
 */
const request = require('supertest');
const { initializeApp } = require('../server/index');

describe('Health Check API', () => {
  let app;

  beforeAll(() => {
    app = initializeApp();
  });

  describe('GET /health', () => {
    it('should return 200 status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should return health status object', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });

    it('should return status "ok"', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });

    it('should return service name "FocusFlow"', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.service).toBe('FocusFlow');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp).toBeInstanceOf(Date);
    });

    it('should return environment as "test"', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.environment).toBe('test');
    });

    it('should return uptime as a number', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});



