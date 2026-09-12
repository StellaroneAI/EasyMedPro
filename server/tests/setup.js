// Jest setup file for EasyMedPro API tests
import { config } from 'dotenv';
import { jest, beforeAll, afterAll } from '@jest/globals';

// Load test environment variables
config({ path: '.env.test' });

// Mock console methods to reduce test output noise
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  if (!process.env.DEBUG_TESTS) {
    console.error = jest.fn();
    console.log = jest.fn();
  }
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

jest.setTimeout(30000);
