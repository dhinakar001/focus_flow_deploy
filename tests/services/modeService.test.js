/**
 * Mode Service Tests
 * 
 * Tests for modeService business logic
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const modeService = require('../../server/services/modeService');
const dbService = require('../../server/services/dbService');

// Mock dbService
jest.mock('../../server/services/dbService');

describe('modeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllModes', () => {
    it('should return all focus modes', async () => {
      const mockModes = [
        { id: 1, name: 'Deep Focus', duration: 50 },
        { id: 2, name: 'Quick Break', duration: 5 },
      ];

      dbService.getAllModes.mockResolvedValue(mockModes);

      const result = await modeService.getAllModes();

      expect(result).toEqual(mockModes);
      expect(dbService.getAllModes).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      dbService.getAllModes.mockRejectedValue(new Error('Database error'));

      await expect(modeService.getAllModes()).rejects.toThrow('Database error');
    });
  });

  describe('getCurrentMode', () => {
    it('should return current active mode for user', async () => {
      const userId = 'user-123';
      const mockMode = {
        userId,
        mode: 'focus',
        sessionId: 'session-123',
        startTime: new Date(),
      };

      dbService.getCurrentFocusSession.mockResolvedValue(mockMode);

      const result = await modeService.getCurrentMode(userId);

      expect(result).toEqual(mockMode);
      expect(dbService.getCurrentFocusSession).toHaveBeenCalledWith(userId);
    });

    it('should return null if no active mode', async () => {
      const userId = 'user-123';
      dbService.getCurrentFocusSession.mockResolvedValue(null);

      const result = await modeService.getCurrentMode(userId);

      expect(result).toBeNull();
    });
  });

  describe('startFocusMode', () => {
    it('should start a new focus session', async () => {
      const userId = 'user-123';
      const mode = 'focus';
      const duration = 50;

      const mockSession = {
        id: 'session-123',
        userId,
        mode,
        duration,
        startTime: new Date(),
      };

      dbService.getCurrentFocusSession.mockResolvedValue(null);
      dbService.createFocusSession.mockResolvedValue(mockSession);

      const result = await modeService.startFocusMode(userId, mode, duration);

      expect(result).toEqual(mockSession);
      expect(dbService.createFocusSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          mode,
          duration,
        })
      );
    });

    it('should not start if already in focus mode', async () => {
      const userId = 'user-123';
      const existingSession = {
        userId,
        mode: 'focus',
        sessionId: 'existing-session',
      };

      dbService.getCurrentFocusSession.mockResolvedValue(existingSession);

      await expect(
        modeService.startFocusMode(userId, 'focus', 50)
      ).rejects.toThrow('already in focus mode');
    });
  });
});

