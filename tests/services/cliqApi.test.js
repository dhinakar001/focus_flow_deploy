/**
 * Cliq API Service Tests
 * 
 * Tests for cliqApi OAuth and API interactions
 */

const { describe, it, expect, beforeEach } = require('@jest/globals');
const cliqApi = require('../../server/services/cliqApi');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('cliqApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAuthorizationUrl', () => {
    it('should generate authorization URL with state', () => {
      const state = 'test-state-123';
      const url = cliqApi.generateAuthorizationUrl({ state });

      expect(url).toContain('state=test-state-123');
      expect(url).toContain('client_id');
      expect(url).toContain('redirect_uri');
      expect(url).toContain('response_type=code');
    });

    it('should throw error if state is missing', () => {
      expect(() => {
        cliqApi.generateAuthorizationUrl({});
      }).toThrow('State parameter is required');
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('should exchange code for tokens successfully', async () => {
      const mockResponse = {
        data: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123',
          expires_in: 3600,
        },
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await cliqApi.exchangeCodeForTokens('auth-code-123');

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const error = new Error('Invalid code');
      error.response = { status: 400, data: { error: 'invalid_grant' } };

      axios.post.mockRejectedValue(error);

      await expect(cliqApi.exchangeCodeForTokens('invalid-code')).rejects.toThrow();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const mockResponse = {
        data: {
          access_token: 'new-access-token',
          expires_in: 3600,
        },
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await cliqApi.refreshAccessToken('refresh-token-123');

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalled();
    });
  });
});

