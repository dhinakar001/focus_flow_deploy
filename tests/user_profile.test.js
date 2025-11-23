/**
 * User Profile API Tests
 * Tests user profile creation and update endpoints
 */
const request = require('supertest');
const { initializeApp } = require('../server/index');
const dbService = require('../server/services/dbService');
const authMiddleware = require('../server/middlewares/authMiddleware');

describe('User Profile API', () => {
  let app;
  let testUser;
  let authToken;

  beforeAll(() => {
    app = initializeApp();
  });

  beforeEach(async () => {
    // Create a test user and get auth token
    const userData = {
      email: `profile${Date.now()}@example.com`,
      username: `profileuser${Date.now()}`,
      password: 'ProfilePassword123!',
      firstName: 'Profile',
      lastName: 'User'
    };

    // Register user
    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData)
      .expect(201);

    testUser = { id: registerResponse.body.data.userId };

    // Login to get token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        emailOrUsername: userData.email,
        password: userData.password
      })
      .expect(200);

    authToken = loginResponse.body.data.tokens.accessToken;
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

  describe('GET /auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('username');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /auth/profile', () => {
    it('should update user profile with valid data', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should update firstName only', async () => {
      const updateData = {
        firstName: 'NewFirstName'
      };

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should update lastName only', async () => {
      const updateData = {
        lastName: 'NewLastName'
      };

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .send({ firstName: 'Test' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'a'.repeat(300) // Too long
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Profile Creation', () => {
    it('should create profile during registration', async () => {
      const userData = {
        email: `newprofile${Date.now()}@example.com`,
        username: `newprofile${Date.now()}`,
        password: 'NewPassword123!',
        firstName: 'New',
        lastName: 'Profile'
      };

      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const userId = registerResponse.body.data.userId;

      // Verify profile was created by logging in
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.data.user).toHaveProperty('firstName', userData.firstName);
      expect(loginResponse.body.data.user).toHaveProperty('lastName', userData.lastName);

      // Cleanup
      try {
        await dbService.deleteUser(userId);
      } catch (error) {
        // Ignore
      }
    });
  });
});



