// Jest setup file for EasyMedPro API tests
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Mock console methods to reduce test output noise
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Suppress console output during tests unless debugging
  if (!process.env.DEBUG_TESTS) {
    console.error = jest.fn();
    console.log = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// Global test timeout
jest.setTimeout(30000);

// Mock external services for testing
jest.mock('../src/mcp/client.js', () => ({
  MCPClient: {
    request: jest.fn().mockImplementation(() => {
      throw new Error('MCP service unavailable - using fallback');
    })
  }
}));

// Mock Twilio for testing
jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'test-message-sid',
        status: 'queued'
      })
    }
  }));
});
