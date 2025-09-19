/**
 * Integration tests for the authentication logging system
 * Tests the complete flow from authentication events to logging
 */

import { vi } from 'vitest';
import authLogger from '../auth-logger';
import { logAuthAttempt, logSessionCreated, logSessionValidation } from '../auth-session-logger';
import { handleAuthError } from '../auth-error-handler';

// Mock console methods
beforeAll(() => {
  console.log = vi.fn();
  console.error = vi.fn();
  console.group = vi.fn();
  console.groupEnd = vi.fn();
});

describe('Authentication Logging Integration', () => {
  beforeEach(() => {
    authLogger.clearBuffer();
    // Ensure we can see all log levels for testing
    authLogger.updateConfig({
      logLevel: 'debug',
      enableConsoleLogging: false,
      enableRemoteLogging: false
    });
  });

  describe('Authentication Flow Logging', () => {
    it('should log successful authentication attempt', async () => {
      const email = 'test@example.com';

      await logAuthAttempt(email, true, undefined, {
        userAgent: 'test-agent',
        location: 'http://localhost:3000/login'
      });

      const logs = authLogger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe('session');
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toContain('Authentication successful');
      expect(logs[0].message).toContain('t***@example.com'); // Masked email
    });

    it('should log failed authentication attempt', async () => {
      const email = 'test@example.com';
      const error = { code: 'invalid_credentials', message: 'Invalid login credentials' };

      await logAuthAttempt(email, false, error, {
        userAgent: 'test-agent',
        location: 'http://localhost:3000/login'
      });

      const logs = authLogger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe('auth');
      expect(logs[0].level).toBe('error');
      expect(logs[0].message).toContain('Authentication failed');
      expect(logs[0].details.errorCode).toBe('invalid_credentials');
    });

    it('should log session creation', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        app_metadata: { provider: 'email' },
        last_sign_in_at: new Date().toISOString()
      };

      const mockSession = {
        access_token: 'token123456789',
        expires_at: Date.now() + 3600000
      };

      await logSessionCreated(mockUser as any, mockSession as any, {
        userAgent: 'test-agent'
      });

      const logs = authLogger.getRecentLogs();
      expect(logs.length).toBeGreaterThan(0);

      const sessionLog = logs.find(log => log.message.includes('session created'));
      expect(sessionLog).toBeDefined();
      expect(sessionLog?.category).toBe('session');
      expect(sessionLog?.level).toBe('info');
    });

    it('should log session validation', async () => {
      const userId = 'user-123';
      const sessionId = 'session-456';

      await logSessionValidation(true, userId, sessionId);

      const logs = authLogger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe('session');
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toContain('Session validation successful');
      expect(logs[0].details.userId).toBe(userId);
      expect(logs[0].details.sessionId).toBe(sessionId);
    });
  });

  describe('Error Handling Integration', () => {
    it('should integrate with auth error handler', async () => {
      const error = new Error('Supabase configuration error');

      const structuredError = handleAuthError(error, {
        context: 'test_integration',
        url: 'https://invalid-url.com'
      });

      // The handleAuthError function should have logged the error
      const logs = authLogger.getRecentLogs();
      expect(logs.length).toBeGreaterThan(0);

      const errorLog = logs.find(log => log.level === 'error');
      expect(errorLog).toBeDefined();
      expect(structuredError.type).toBeDefined();
      expect(structuredError.userMessage).toBeDefined();
    });

    it('should handle configuration errors with proper logging', async () => {
      const configError = new Error('Invalid Supabase URL format');

      const structuredError = handleAuthError(configError, {
        context: 'config_validation',
        url: 'invalid-url'
      });

      // The error type depends on the error handler's logic
      expect(structuredError.type).toBeDefined();
      expect(['config', 'auth']).toContain(structuredError.type);

      const logs = authLogger.getRecentLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Environment-Specific Behavior', () => {
    it('should respect production logging settings', () => {
      const prodLogger = authLogger;
      prodLogger.updateConfig({
        environment: 'production',
        maskSensitiveData: true,
        logLevel: 'error'
      });

      const config = prodLogger.getConfig();
      expect(config.maskSensitiveData).toBe(true);
      expect(config.logLevel).toBe('error');
    });

    it('should respect development logging settings', () => {
      const devLogger = authLogger;
      devLogger.updateConfig({
        environment: 'development',
        maskSensitiveData: false,
        logLevel: 'debug'
      });

      const config = devLogger.getConfig();
      expect(config.maskSensitiveData).toBe(false);
      expect(config.logLevel).toBe('debug');
    });
  });

  describe('Log Buffer Management', () => {
    it('should maintain logs across multiple authentication events', async () => {
      // Simulate multiple authentication events
      await logAuthAttempt('user1@example.com', false, { code: 'invalid_password' });
      await logAuthAttempt('user2@example.com', true);
      await logSessionValidation(true, 'user2', 'session-123');

      const logs = authLogger.getRecentLogs();
      expect(logs.length).toBeGreaterThanOrEqual(3);

      // Should have different types of logs
      const categories = logs.map(log => log.category);
      expect(categories).toContain('auth');
      expect(categories).toContain('session');
    });

    it('should clear buffer when requested', async () => {
      await logAuthAttempt('test@example.com', true);
      expect(authLogger.getRecentLogs()).toHaveLength(1);

      authLogger.clearBuffer();
      expect(authLogger.getRecentLogs()).toHaveLength(0);
    });
  });
});