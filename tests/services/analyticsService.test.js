/**
 * Analytics Service Tests
 * 
 * Tests for analyticsService scoring and calculation functions
 */

const { describe, it, expect } = require('@jest/globals');
const analyticsService = require('../../server/services/analyticsService');

describe('analyticsService', () => {
  describe('calculateProductivityScore', () => {
    it('should calculate productivity score correctly', () => {
      const sessionData = {
        totalFocusMinutes: 240,
        totalSessions: 5,
        completedTasks: 8,
        interruptedSessions: 1,
        blockedMessages: 10,
      };

      const score = analyticsService.calculateProductivityScore(sessionData);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(typeof score).toBe('number');
    });

    it('should return 0 for no sessions', () => {
      const sessionData = {
        totalFocusMinutes: 0,
        totalSessions: 0,
      };

      const score = analyticsService.calculateProductivityScore(sessionData);
      expect(score).toBe(0);
    });

    it('should handle maximum score scenario', () => {
      const sessionData = {
        totalFocusMinutes: 480, // 8 hours
        totalSessions: 10,
        completedTasks: 10,
        interruptedSessions: 0,
        blockedMessages: 0,
      };

      const score = analyticsService.calculateProductivityScore(sessionData);
      expect(score).toBeGreaterThan(80);
    });
  });

  describe('calculateFocusScore', () => {
    it('should calculate focus score correctly', () => {
      const sessionData = {
        totalFocusMinutes: 240,
        totalSessions: 5,
        interruptedSessions: 1,
      };

      const score = analyticsService.calculateFocusScore(sessionData);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for no sessions', () => {
      const sessionData = {
        totalFocusMinutes: 0,
        totalSessions: 0,
      };

      const score = analyticsService.calculateFocusScore(sessionData);
      expect(score).toBe(0);
    });
  });

  describe('calculateEfficiencyScore', () => {
    it('should calculate efficiency score correctly', () => {
      const sessionData = {
        totalSessions: 5,
        interruptedSessions: 1,
        completedTasks: 8,
        totalFocusMinutes: 240,
      };

      const score = analyticsService.calculateEfficiencyScore(sessionData);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for no sessions', () => {
      const sessionData = {
        totalSessions: 0,
      };

      const score = analyticsService.calculateEfficiencyScore(sessionData);
      expect(score).toBe(0);
    });
  });

  describe('calculateEngagementScore', () => {
    it('should calculate engagement score correctly', () => {
      const sessionData = {
        totalSessions: 5,
        totalFocusMinutes: 300,
      };

      const score = analyticsService.calculateEngagementScore(sessionData);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});

