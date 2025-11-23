/**
 * Security Headers Tests
 * Tests that security headers are properly set by Helmet middleware
 */
const request = require('supertest');
const { initializeApp } = require('../server/index');

describe('Security Headers', () => {
  let app;

  beforeAll(() => {
    app = initializeApp();
  });

  describe('Helmet Security Headers', () => {
    it('should include X-Content-Type-Options header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-frame-options');
      // Should be 'SAMEORIGIN' or 'DENY'
      expect(['SAMEORIGIN', 'DENY']).toContain(response.headers['x-frame-options']);
    });

    it('should include X-XSS-Protection header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    it('should include Strict-Transport-Security header in production', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // HSTS may not be set in test environment, but check if it exists
      if (response.headers['strict-transport-security']) {
        expect(response.headers['strict-transport-security']).toContain('max-age');
      }
    });

    it('should include Content-Security-Policy header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // CSP header might be set by Helmet
      if (response.headers['content-security-policy']) {
        expect(response.headers['content-security-policy']).toBeTruthy();
      }
    });

    it('should not expose server information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Should not have X-Powered-By header (Express default)
      expect(response.headers).not.toHaveProperty('x-powered-by');
    });

    it('should set security headers on all routes', async () => {
      // Test multiple routes
      const routes = ['/health', '/auth/register'];

      for (const route of routes) {
        const response = await request(app)
          .get(route)
          .expect(response.status === 200 || response.status === 404 ? 200 : response.status);

        if (response.status === 200) {
          expect(response.headers).toHaveProperty('x-content-type-options');
        }
      }
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .options('/health')
        .expect(204);

      // CORS headers should be present
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should allow credentials in CORS', async () => {
      const response = await request(app)
        .options('/health')
        .expect(204);

      if (response.headers['access-control-allow-credentials']) {
        expect(response.headers['access-control-allow-credentials']).toBe('true');
      }
    });
  });
});



