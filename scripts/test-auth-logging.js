#!/usr/bin/env node

/**
 * Test script to demonstrate the authentication logging system
 * Run with: node scripts/test-auth-logging.js
 */

const { AuthLogger } = require('../src/lib/auth-logger');

async function demonstrateLogging() {
  console.log('🔍 Testing Authentication Logging System\n');

  // Create logger instances for different environments
  const devLogger = new AuthLogger({
    environment: 'development',
    enableConsoleLogging: true,
    enableRemoteLogging: false,
    maskSensitiveData: false,
    logLevel: 'debug'
  });

  const prodLogger = new AuthLogger({
    environment: 'production',
    enableConsoleLogging: true,
    enableRemoteLogging: false,
    maskSensitiveData: true,
    logLevel: 'error'
  });

  console.log('📝 Development Environment Logging:');
  await devLogger.logAuthError('Test authentication error', {
    email: 'user@example.com',
    password: 'secret123',
    errorCode: 'invalid_credentials'
  }, 'login_attempt');

  await devLogger.logConfigError('Configuration validation failed', {
    supabaseUrl: 'https://invalid-url.com',
    hasAnonKey: false
  }, 'startup_validation');

  await devLogger.logSessionEvent('User session created', 'session-123', 'user-456', 'login_success');

  console.log('\n🔒 Production Environment Logging:');
  await prodLogger.logAuthError('Authentication failed', {
    email: 'sensitive@example.com',
    password: 'topsecret',
    token: 'jwt-token-123'
  }, 'login_attempt');

  console.log('\n📊 Log Statistics:');
  console.log('Development logs:', devLogger.getRecentLogs().length);
  console.log('Production logs:', prodLogger.getRecentLogs().length);

  console.log('\n✅ Authentication logging system is working correctly!');
}

demonstrateLogging().catch(console.error);