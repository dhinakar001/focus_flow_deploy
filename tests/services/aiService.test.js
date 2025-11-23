/**
 * AI Service Tests
 * 
 * Tests for aiService integration with Python AI service
 */

const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const aiService = require('../../server/services/aiService');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('summarizeTasks', () => {
    it('should summarize tasks successfully', async () => {
      const mockTasks = [
        { title: 'Task 1', priority: 'high' },
        { title: 'Task 2', priority: 'medium' },
      ];

      const mockResponse = {
        data: {
          summary: 'Test summary',
          total_tasks: 2,
          total_estimated_minutes: 120,
        },
      };

      axios.mockResolvedValue(mockResponse);

      const result = await aiService.summarizeTasks(mockTasks);

      expect(result).toEqual(mockResponse.data);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: expect.stringContaining('/api/ai/focus-coach/summarize'),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockTasks = [{ title: 'Task 1' }];
      const error = new Error('Network error');
      error.response = { data: { error: 'Service unavailable' } };

      axios.mockRejectedValue(error);

      await expect(aiService.summarizeTasks(mockTasks)).rejects.toThrow('AI service error');
    });
  });

  describe('generateFocusPlan', () => {
    it('should generate focus plan successfully', async () => {
      const mockTasks = [{ title: 'Task 1', priority: 'high' }];
      const mockResponse = {
        data: {
          title: 'Focus Plan',
          description: 'Test plan',
          recommended_schedule: [],
        },
      };

      axios.mockResolvedValue(mockResponse);

      const result = await aiService.generateFocusPlan(mockTasks);

      expect(result).toEqual(mockResponse.data);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: expect.stringContaining('/api/ai/focus-coach/generate-plan'),
        })
      );
    });
  });

  describe('analyzeDistractions', () => {
    it('should analyze distractions successfully', async () => {
      const mockActivities = [
        { activity_type: 'message', timestamp: new Date().toISOString() },
      ];

      const mockResponse = {
        data: {
          distraction_score: 0.7,
          recommendations: [],
        },
      };

      axios.mockResolvedValue(mockResponse);

      const result = await aiService.analyzeDistractions(mockActivities);

      expect(result).toEqual(mockResponse.data);
    });
  });
});

