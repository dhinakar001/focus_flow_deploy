/**
 * User Service Tests
 * 
 * Tests for userService business logic
 */

const { describe, it, expect, beforeEach } = require('@jest/globals');
const userService = require('../../server/services/userService');
const dbService = require('../../server/services/dbService');
const bcrypt = require('bcryptjs');

// Mock dependencies
jest.mock('../../server/services/dbService');
jest.mock('bcryptjs');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const hashedPassword = 'hashed-password-123';
      const mockUser = {
        id: 'user-123',
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
      };

      bcrypt.hash.mockResolvedValue(hashedPassword);
      dbService.createUser.mockResolvedValue(mockUser);
      dbService.getUserByEmail.mockResolvedValue(null);
      dbService.getUserByUsername.mockResolvedValue(null);

      const result = await userService.createUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
      expect(dbService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'Password123!',
      };

      dbService.getUserByEmail.mockResolvedValue({ id: 'existing-user' });

      await expect(userService.createUser(userData)).rejects.toThrow(
        'email already exists'
      );
    });

    it('should throw error if username already exists', async () => {
      const userData = {
        email: 'new@example.com',
        username: 'existinguser',
        password: 'Password123!',
      };

      dbService.getUserByEmail.mockResolvedValue(null);
      dbService.getUserByUsername.mockResolvedValue({ id: 'existing-user' });

      await expect(userService.createUser(userData)).rejects.toThrow(
        'username already exists'
      );
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'Password123!';
      const hashedPassword = 'hashed-password';

      const mockUser = {
        id: 'user-123',
        email,
        username: 'testuser',
        password: hashedPassword,
      };

      dbService.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await userService.authenticateUser(email, password);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
    });

    it('should throw error for invalid email', async () => {
      dbService.getUserByEmail.mockResolvedValue(null);

      await expect(
        userService.authenticateUser('invalid@example.com', 'password')
      ).rejects.toThrow('invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      dbService.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        userService.authenticateUser('test@example.com', 'wrong-password')
      ).rejects.toThrow('invalid credentials');
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      const userId = 'user-123';
      const mockProfile = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      };

      dbService.getUserById.mockResolvedValue(mockProfile);

      const result = await userService.getUserProfile(userId);

      expect(result).toEqual(mockProfile);
      expect(dbService.getUserById).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user not found', async () => {
      dbService.getUserById.mockResolvedValue(null);

      await expect(userService.getUserProfile('invalid-id')).rejects.toThrow(
        'user not found'
      );
    });
  });
});

