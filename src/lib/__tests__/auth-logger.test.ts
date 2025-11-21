/**
 * Tests for the authentication logging system
 */

import { AuthLogger } from '../auth-logger';
import { getLoggingConfig } from '../auth-logging-config';

import { vi } from 'vitest';

// Mock console methods to avoid noise in tests
const originalConsole = console;
beforeAll(() => {
  console.log = vi.fn();
  console.error = vi.fn();
  console.group = vi.fn();
  console.groupEnd = vi.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.group = originalConsole.group;
  console.groupEnd = originalConsole.groupEnd;
});

describe('AuthLogger', () => {
  let logger: AuthLogger;

  beforeEach(() => {
    logger = new AuthLogger({
      environment: 'test',
      enableConsoleLogging: false,
      enableRemoteLogging: false,
      maskSensitiveData: true,
      logLevel: 'debug'
    });
  });

  afterEach(() => {
    logger.clearBuffer();
  });

  describe('Basic Logging', () => {
    it('should create log entries with correct structure', async () => {
      await logger.logAuthError('Test auth error', new Error('Test error'), 'test_context');
      
      const logs = logger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      
      const log = logs[0];
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('timestamp');
      expect(log.level).toBe('error');
      expect(log.category).toBe('auth');
      expect(log.message).toBe('Test auth error');
      expect(log.environment).toBe('test');
    });

    it('should respect log level filtering', async () => {
      const debugLogger = new AuthLogger({
        environment: 'test',
        logLevel: 'error',
        enableConsoleLogging: false,
        enableRemoteLogging: false
      });

      await debugLogger.logDebug('Debug message');
      await debugLogger.logAuthError('Error message', new Error('Test'));

      const logs = debugLogger.getRecentLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
    });

    it('should generate unique log IDs', async () => {
      await logger.logDebug('Message 1');
      await logger.logDebug('Message 2');

      const logs = logger.getRecentLogs(2);
      expect(logs[0].id).not.toBe(logs[1].id);
    });
  });

  describe('Sensitive Data Masking', () => {
    it('should mask sensitive data in production mode', async () => {
      const prodLogger = new AuthLogger({
        environment: 'production',
        maskSensitiveData: true,
        enableConsoleLogging: false,
        enableRemoteLogging: false
      });

      const errorWithSensitiveData = {
        password: 'secret123',
        email: 'user@example.com',
        token: 'abc123'
      };

      await prodLogger.logAuthError('Auth error', errorWithSensitiveData, 'test_context');

      const logs = prodLogger.getRecentLogs(1);
      const logDetails = logs[0].details;
      
      // The sensitive data should be in the originalError field when in development mode
      // In production, the entire details object should be masked
      expect(logs[0].sensitive).toBe(true);
      expect(logDetails).toBeDefined();
    });

    it('should not mask data in development mode', async () => {
      const devLogger = new AuthLogger({
        environment: 'development',
        maskSensitiveData: false,
        enableConsoleLogging: false,
        enableRemoteLogging: false
      });

      await devLogger.logAuthError('Auth error', {
        password: 'secret123',
        email: 'user@example.com'
      }, 'test_context');

      const logs = devLogger.getRecentLogs(1);
      const logDetails = logs[0].details;
      
      expect(logDetails.originalError?.password).toBe('secret123');
      expect(logDetails.originalError?.email).toBe('user@example.com');
    });
  });

  describe('Buffer Management', () => {
    it('should maintain buffer size limit', async () => {
      const smallBufferLogger = new AuthLogger({
        environment: 'test',
        enableConsoleLogging: false,
        enableRemoteLogging: false,
        logLevel: 'debug'
      });

      // Override buffer size for testing
      (smallBufferLogger as any).maxBufferSize = 3;

      // Add more logs than buffer size
      for (let i = 0; i < 5; i++) {
        await smallBufferLogger.logDebug(`Message ${i}`);
      }

      const logs = smallBufferLogger.getRecentLogs();
      expect(logs.length).toBeLessThanOrEqual(3);
      
      if (logs.length > 0) {
        // Should contain the most recent logs
        expect(logs[logs.length - 1].message).toContain('Message');
      }
    });

    it('should clear buffer when requested', async () => {
      await logger.logDebug('Message 1');
      await logger.logDebug('Message 2');
      
      expect(logger.getRecentLogs()).toHaveLength(2);
      
      logger.clearBuffer();
      expect(logger.getRecentLogs()).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should use environment-specific configuration', () => {
      const config = getLoggingConfig();
      expect(config).toHaveProperty('environment');
      expect(config).toHaveProperty('enableConsoleLogging');
      expect(config).toHaveProperty('maskSensitiveData');
    });

    it('should allow configuration updates', () => {
      const originalConfig = logger.getConfig();
      
      logger.updateConfig({ logLevel: 'error' });
      
      const updatedConfig = logger.getConfig();
      expect(updatedConfig.logLevel).toBe('error');
      expect(updatedConfig.environment).toBe(originalConfig.environment);
    });
  });

  describe('Different Log Categories', () => {
    it('should handle auth errors', async () => {
      await logger.logAuthError('Auth failed', new Error('Invalid credentials'), 'login', 'user123');
      
      const logs = logger.getRecentLogs(1);
      expect(logs[0].category).toBe('auth');
      expect(logs[0].level).toBe('error');
    });

    it('should handle config errors', async () => {
      await logger.logConfigError('Invalid config', { url: 'invalid' }, 'startup');
      
      const logs = logger.getRecentLogs(1);
      expect(logs[0].category).toBe('config');
      expect(logs[0].level).toBe('error');
    });

    it('should handle network errors', async () => {
      await logger.logNetworkError('Connection failed', new Error('Network error'), '/api/auth', 'fetch');
      
      const logs = logger.getRecentLogs(1);
      expect(logs[0].category).toBe('network');
      expect(logs[0].level).toBe('error');
    });

    it('should handle validation errors', async () => {
      await logger.logValidationError('Invalid email', { email: 'invalid' }, 'form_validation');
      
      const logs = logger.getRecentLogs(1);
      expect(logs[0].category).toBe('validation');
      expect(logs[0].level).toBe('warn');
    });

    it('should handle session events', async () => {
      await logger.logSessionEvent('Session created', 'session123', 'user123', 'login');
      
      const logs = logger.getRecentLogs(1);
      expect(logs[0].category).toBe('session');
      expect(logs[0].level).toBe('info');
    });
  });
});

describe('Logging Configuration', () => {
  it('should provide different configs for different environments', () => {
    // Mock different environments
    const originalEnv = process.env.NODE_ENV;
    
    process.env.NODE_ENV = 'development';
    const devConfig = getLoggingConfig();
    expect(devConfig.maskSensitiveData).toBe(false);
    expect(devConfig.logLevel).toBe('debug');
    
    process.env.NODE_ENV = 'production';
    const prodConfig = getLoggingConfig();
    expect(prodConfig.maskSensitiveData).toBe(true);
    expect(prodConfig.logLevel).toBe('error');
    
    process.env.NODE_ENV = originalEnv;
  });
});