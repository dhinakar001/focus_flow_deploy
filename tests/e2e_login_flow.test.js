/**
 * End-to-End Login Flow Tests
 * Tests complete user registration and login flow with test database
 */
const request = require('supertest');
const { initializeApp } = require('../server/index');
const dbService = require('../server/services/dbService');

describe('E2E Login Flow', () => {
  let app;
  let testUser;

  beforeAll(() => {
    app = initializeApp();
  });

  afterEach(async () => {
    // Clean up test user
    if (testUser && testUser.id) {
      try {
        await dbService.deleteUser(testUser.id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('Complete User Registration and Login Flow', () => {
    it('should complete full registration -> login -> profile access flow', async () => {
      const userData = {
        email: `e2e${Date.now()}@example.com`,
        username: `e2euser${Date.now()}`,
        password: 'E2EPassword123!',
        firstName: 'E2E',
        lastName: 'Test'
      };

      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('success', true);
      expect(registerResponse.body.data).toHaveProperty('userId');
      
      const userId = registerResponse.body.data.userId;
      testUser = { id: userId };

      // Step 2: Login with email
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('success', true);
      expect(loginResponse.body.data).toHaveProperty('tokens');
      expect(loginResponse.body.data.tokens).toHaveProperty('accessToken');
      expect(loginResponse.body.data.tokens).toHaveProperty('refreshToken');

      const accessToken = loginResponse.body.data.tokens.accessToken;
      const refreshToken = loginResponse.body.data.tokens.refreshToken;

      // Step 3: Access protected profile endpoint
      const profileResponse = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body).toHaveProperty('success', true);
      expect(profileResponse.body.data).toHaveProperty('id', userId);
      expect(profileResponse.body.data).toHaveProperty('email', userData.email);
      expect(profileResponse.body.data).toHaveProperty('username', userData.username);

      // Step 4: Refresh token
      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('success', true);
      expect(refreshResponse.body.data).toHaveProperty('accessToken');

      // Step 5: Use new access token
      const newAccessToken = refreshResponse.body.data.accessToken;
      const profileResponse2 = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      expect(profileResponse2.body).toHaveProperty('success', true);
    });

    it('should handle login with username after registration', async () => {
      const userData = {
        email: `e2eusername${Date.now()}@example.com`,
        username: `e2eusername${Date.now()}`,
        password: 'UsernameLogin123!',
        firstName: 'Username',
        lastName: 'Login'
      };

      // Register
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      testUser = { id: registerResponse.body.data.userId };

      // Login with username
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: userData.username,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should handle failed login attempts gracefully', async () => {
      const userData = {
        email: `e2efail${Date.now()}@example.com`,
        username: `e2efail${Date.now()}`,
        password: 'FailTest123!',
        firstName: 'Fail',
        lastName: 'Test'
      };

      // Register
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      testUser = { id: registerResponse.body.data.userId };

      // Attempt login with wrong password
      const failedLogin = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: userData.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(failedLogin.body).toHaveProperty('error');
      expect(failedLogin.body.error).toContain('Invalid credentials');

      // Correct login should still work
      const correctLogin = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(correctLogin.body).toHaveProperty('success', true);
    });

    it('should handle token refresh flow', async () => {
      const userData = {
        email: `e2erefresh${Date.now()}@example.com`,
        username: `e2erefresh${Date.now()}`,
        password: 'RefreshTest123!',
        firstName: 'Refresh',
        lastName: 'Test'
      };

      // Register and login
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: userData.email,
          password: userData.password
        })
        .expect(200);

      const refreshToken = loginResponse.body.data.tokens.refreshToken;

      // Refresh token
      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body.data).toHaveProperty('accessToken');

      // New access token should work
      const newAccessToken = refreshResponse.body.data.accessToken;
      const profileResponse = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      expect(profileResponse.body).toHaveProperty('success', true);
    });

    it('should handle logout flow', async () => {
      const userData = {
        email: `e2elogout${Date.now()}@example.com`,
        username: `e2elogout${Date.now()}`,
        password: 'LogoutTest123!',
        firstName: 'Logout',
        lastName: 'Test'
      };

      // Register and login
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      testUser = { id: registerResponse.body.data.userId };

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: userData.email,
          password: userData.password
        })
        .expect(200);

      const accessToken = loginResponse.body.data.tokens.accessToken;

      // Logout
      const logoutResponse = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(logoutResponse.body).toHaveProperty('success', true);
    });
  });
});



