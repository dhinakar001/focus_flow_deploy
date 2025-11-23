/**
 * Authentication API Tests
 * Tests user registration and login endpoints
 */
const request = require('supertest');
const { initializeApp } = require('../server/index');
const dbService = require('../server/services/dbService');

describe('Authentication API', () => {
  let app;
  let testUser;

  beforeAll(() => {
    app = initializeApp();
  });

  beforeEach(async () => {
    // Clean up test user if exists
    if (testUser) {
      try {
        await dbService.deleteUser(testUser.id);
      } catch (error) {
        // User might not exist, ignore
      }
    }
    testUser = null;
  });

  afterEach(async () => {
    // Clean up test user after each test
    if (testUser) {
      try {
        await dbService.deleteUser(testUser.id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('POST /auth/register', () => {
    const validUserData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('email', validUserData.email);
      expect(response.body.data).toHaveProperty('username', validUserData.username);

      // Store user ID for cleanup
      testUser = { id: response.body.data.userId };
    });

    it('should return 400 if email is missing', async () => {
      const { email, ...dataWithoutEmail } = validUserData;

      const response = await request(app)
        .post('/auth/register')
        .send(dataWithoutEmail)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if password is missing', async () => {
      const { password, ...dataWithoutPassword } = validUserData;

      const response = await request(app)
        .post('/auth/register')
        .send(dataWithoutPassword)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if username is missing', async () => {
      const { username, ...dataWithoutUsername } = validUserData;

      const response = await request(app)
        .post('/auth/register')
        .send(dataWithoutUsername)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          ...validUserData,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 if email already exists', async () => {
      // Register first user
      await request(app)
        .post('/auth/register')
        .send(validUserData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/auth/register')
        .send({
          ...validUserData,
          username: 'differentusername'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should return 409 if username already exists', async () => {
      // Register first user
      await request(app)
        .post('/auth/register')
        .send(validUserData)
        .expect(201);

      // Try to register with same username
      const response = await request(app)
        .post('/auth/register')
        .send({
          ...validUserData,
          email: 'different@example.com'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already taken');
    });
  });

  describe('POST /auth/login', () => {
    const userData = {
      email: 'login@example.com',
      username: 'loginuser',
      password: 'LoginPassword123!',
      firstName: 'Login',
      lastName: 'User'
    };

    beforeEach(async () => {
      // Register a user before login tests
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      testUser = { id: registerResponse.body.data.userId };
    });

    it('should login with email successfully', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should login with username successfully', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: userData.username,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('tokens');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: userData.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: 'nonexistent@example.com',
          password: 'SomePassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if email/username is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: userData.password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          emailOrUsername: userData.email
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});



