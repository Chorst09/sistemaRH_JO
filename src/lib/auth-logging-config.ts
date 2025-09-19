/**
 * Configuration for the authentication logging system
 * Allows customization of logging behavior per environment
 */

import type { LoggerConfig } from './auth-logger';

/**
 * Default logging configurations for different environments
 */
export const LOGGING_CONFIGS: Record<string, Partial<LoggerConfig>> = {
  development: {
    environment: 'development',
    enableConsoleLogging: true,
    enableRemoteLogging: false,
    maskSensitiveData: false,
    logLevel: 'debug',
  },
  
  production: {
    environment: 'production',
    enableConsoleLogging: false,
    enableRemoteLogging: true,
    maskSensitiveData: true,
    logLevel: 'error',
  },
  
  test: {
    environment: 'test',
    enableConsoleLogging: false,
    enableRemoteLogging: false,
    maskSensitiveData: true,
    logLevel: 'warn',
  },
  
  staging: {
    environment: 'production', // Use production settings but with more logging
    enableConsoleLogging: true,
    enableRemoteLogging: true,
    maskSensitiveData: true,
    logLevel: 'info',
  }
};

/**
 * Gets the appropriate logging configuration for the current environment
 */
export function getLoggingConfig(): Partial<LoggerConfig> {
  const env = process.env.NODE_ENV || 'development';
  const customEnv = process.env.NEXT_PUBLIC_APP_ENV; // Allow custom environment override
  
  // Check for custom environment first
  if (customEnv && LOGGING_CONFIGS[customEnv]) {
    return LOGGING_CONFIGS[customEnv];
  }
  
  // Fall back to NODE_ENV
  return LOGGING_CONFIGS[env] || LOGGING_CONFIGS.development;
}

/**
 * Environment-specific sensitive data patterns
 */
export const SENSITIVE_PATTERNS = {
  development: [
    'password', 'token', 'key', 'secret', 'auth'
  ],
  production: [
    'password', 'token', 'key', 'secret', 'auth', 'credential',
    'email', 'phone', 'ssn', 'cpf', 'cnpj', 'address', 'name'
  ],
  test: [
    'password', 'token', 'key', 'secret', 'auth', 'credential'
  ]
};

/**
 * Gets sensitive data patterns for the current environment
 */
export function getSensitivePatterns(): string[] {
  const env = process.env.NODE_ENV || 'development';
  return SENSITIVE_PATTERNS[env as keyof typeof SENSITIVE_PATTERNS] || SENSITIVE_PATTERNS.development;
}

/**
 * Remote logging service configurations
 */
export const REMOTE_LOGGING_SERVICES = {
  // Example configurations for popular logging services
  sentry: {
    enabled: process.env.NEXT_PUBLIC_SENTRY_DSN !== undefined,
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
  },
  
  logRocket: {
    enabled: process.env.NEXT_PUBLIC_LOGROCKET_APP_ID !== undefined,
    appId: process.env.NEXT_PUBLIC_LOGROCKET_APP_ID,
  },
  
  datadog: {
    enabled: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN !== undefined,
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    site: process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com',
  },
  
  customEndpoint: {
    enabled: process.env.NEXT_PUBLIC_CUSTOM_LOG_ENDPOINT !== undefined,
    endpoint: process.env.NEXT_PUBLIC_CUSTOM_LOG_ENDPOINT,
    apiKey: process.env.NEXT_PUBLIC_CUSTOM_LOG_API_KEY,
  }
};

/**
 * Gets the active remote logging service configuration
 */
export function getRemoteLoggingConfig() {
  // Check which service is configured and return the first available
  for (const [serviceName, config] of Object.entries(REMOTE_LOGGING_SERVICES)) {
    if (config.enabled) {
      return { service: serviceName, config };
    }
  }
  
  return null;
}

/**
 * Log retention policies
 */
export const LOG_RETENTION = {
  development: {
    bufferSize: 100,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  production: {
    bufferSize: 50,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  test: {
    bufferSize: 10,
    maxAge: 60 * 60 * 1000, // 1 hour
  }
};

/**
 * Gets log retention policy for current environment
 */
export function getLogRetentionPolicy() {
  const env = process.env.NODE_ENV || 'development';
  return LOG_RETENTION[env as keyof typeof LOG_RETENTION] || LOG_RETENTION.development;
}

/**
 * Feature flags for logging functionality
 */
export const LOGGING_FEATURES = {
  enableSessionTracking: process.env.NEXT_PUBLIC_ENABLE_SESSION_TRACKING !== 'false',
  enablePerformanceLogging: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_LOGGING === 'true',
  enableUserBehaviorTracking: process.env.NEXT_PUBLIC_ENABLE_USER_BEHAVIOR_TRACKING === 'true',
  enableErrorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING !== 'false',
  enableDebugPanel: process.env.NODE_ENV === 'development',
};

/**
 * Validates logging configuration
 */
export function validateLoggingConfig(config: Partial<LoggerConfig>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required environment variables in production
  if (config.environment === 'production') {
    if (config.enableRemoteLogging && !getRemoteLoggingConfig()) {
      warnings.push('Remote logging is enabled but no logging service is configured');
    }
    
    if (!config.maskSensitiveData) {
      errors.push('Sensitive data masking must be enabled in production');
    }
    
    if (config.logLevel === 'debug') {
      warnings.push('Debug log level is not recommended for production');
    }
  }

  // Check for development-specific issues
  if (config.environment === 'development') {
    if (config.enableRemoteLogging) {
      warnings.push('Remote logging in development may impact performance');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  getLoggingConfig,
  getSensitivePatterns,
  getRemoteLoggingConfig,
  getLogRetentionPolicy,
  validateLoggingConfig,
  LOGGING_FEATURES
};