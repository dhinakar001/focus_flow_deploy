/**
 * Jest test setup file
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '4001'; // Different port for tests
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.TOKEN_ENCRYPTION_KEY = 'dGVzdC1lbmNyeXB0aW9uLWtleS1mb3ItdGVzdGluZy1vbmx5';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://focusflow_test:test_password@localhost:5432/focusflow_test';
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests
process.env.FRONTEND_URL = 'http://localhost:3000';

// Suppress console logs during tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}

// Global test timeout
jest.setTimeout(10000);



