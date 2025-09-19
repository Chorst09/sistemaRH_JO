/**
 * Comprehensive authentication error logging system
 * Provides structured logging with environment-specific behavior
 */

import { getLoggingConfig, getSensitivePatterns, getLogRetentionPolicy } from './auth-logging-config';

export interface AuthLogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  category: 'auth' | 'config' | 'network' | 'validation' | 'session';
  message: string;
  details: {
    errorCode?: string;
    statusCode?: number;
    userAgent?: string;
    url?: string;
    context?: string;
    userId?: string;
    sessionId?: string;
    [key: string]: any;
  };
  environment: 'development' | 'production' | 'test';
  sensitive: boolean; // Flag to indicate if entry contains sensitive data
}

export interface LoggerConfig {
  environment: 'development' | 'production' | 'test';
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  maskSensitiveData: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

class AuthLogger {
  private config: LoggerConfig;
  private logBuffer: AuthLogEntry[] = [];
  private maxBufferSize = 100;

  constructor(config?: Partial<LoggerConfig>) {
    // Get environment-specific configuration
    const envConfig = getLoggingConfig();
    
    this.config = {
      environment: (process.env.NODE_ENV as any) || 'development',
      enableConsoleLogging: true,
      enableRemoteLogging: process.env.NODE_ENV === 'production',
      maskSensitiveData: process.env.NODE_ENV === 'production',
      logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
      ...envConfig,
      ...config,
    };

    // Apply retention policy
    const retentionPolicy = getLogRetentionPolicy();
    this.maxBufferSize = retentionPolicy.bufferSize;
  }

  /**
   * Generates a unique log entry ID
   */
  private generateLogId(): string {
    return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Masks sensitive data in production environment
   */
  private maskSensitiveData(data: any): any {
    if (!this.config.maskSensitiveData) {
      return data;
    }

    const sensitiveKeys = getSensitivePatterns();

    const maskValue = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(maskValue);
      }

      const masked: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const keyLower = key.toLowerCase();
        const shouldMask = sensitiveKeys.some(sensitive => keyLower.includes(sensitive));
        
        if (shouldMask && typeof value === 'string') {
          // Mask email addresses partially
          if (keyLower.includes('email') && value.includes('@')) {
            const [local, domain] = value.split('@');
            masked[key] = `${local.charAt(0)}***@${domain}`;
          } else {
            masked[key] = '***MASKED***';
          }
        } else if (typeof value === 'object') {
          masked[key] = maskValue(value);
        } else {
          masked[key] = value;
        }
      }
      return masked;
    };

    return maskValue(data);
  }

  /**
   * Determines if log should be recorded based on level
   */
  private shouldLog(level: AuthLogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex >= currentLevelIndex;
  }

  /**
   * Creates a structured log entry
   */
  private createLogEntry(
    level: AuthLogEntry['level'],
    category: AuthLogEntry['category'],
    message: string,
    details: Partial<AuthLogEntry['details']> = {},
    sensitive = false
  ): AuthLogEntry {
    const entry: AuthLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        ...details,
      },
      environment: this.config.environment,
      sensitive,
    };

    // Mask sensitive data if needed
    if (sensitive || this.config.maskSensitiveData) {
      entry.details = this.maskSensitiveData(entry.details);
    }

    return entry;
  }

  /**
   * Adds log entry to buffer and manages buffer size
   */
  private addToBuffer(entry: AuthLogEntry): void {
    this.logBuffer.push(entry);
    
    // Maintain buffer size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Outputs log to console with formatting
   */
  private logToConsole(entry: AuthLogEntry): void {
    if (!this.config.enableConsoleLogging) return;

    const emoji = {
      error: '🚨',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🔍'
    }[entry.level];

    const categoryColor = {
      auth: 'color: #ff6b6b',
      config: 'color: #4ecdc4',
      network: 'color: #45b7d1',
      validation: 'color: #f9ca24',
      session: 'color: #6c5ce7'
    }[entry.category];

    console.group(`${emoji} Auth Log [${entry.category.toUpperCase()}]`);
    console.log(`%c${entry.message}`, categoryColor);
    console.log('Timestamp:', entry.timestamp);
    console.log('Level:', entry.level);
    console.log('ID:', entry.id);
    
    if (entry.details.errorCode) {
      console.log('Error Code:', entry.details.errorCode);
    }
    
    if (entry.details.statusCode) {
      console.log('Status Code:', entry.details.statusCode);
    }
    
    if (entry.details.context) {
      console.log('Context:', entry.details.context);
    }

    // Show full details in development
    if (this.config.environment === 'development') {
      console.log('Full Details:', entry.details);
    }
    
    console.groupEnd();
  }

  /**
   * Sends log to remote logging service (placeholder)
   */
  private async logToRemote(entry: AuthLogEntry): Promise<void> {
    if (!this.config.enableRemoteLogging) return;

    try {
      // In a real implementation, you would send to your logging service
      // Examples: Sentry, LogRocket, DataDog, CloudWatch, etc.
      
      // For now, we'll just simulate the call
      if (this.config.environment === 'development') {
        console.log('📡 Would send to remote logging service:', {
          service: 'remote-logger',
          entry: entry
        });
      }
      
      // Example implementation:
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
      
    } catch (error) {
      // Don't let logging errors break the application
      console.error('Failed to send log to remote service:', error);
    }
  }

  /**
   * Main logging method
   */
  private async log(
    level: AuthLogEntry['level'],
    category: AuthLogEntry['category'],
    message: string,
    details: Partial<AuthLogEntry['details']> = {},
    sensitive = false
  ): Promise<void> {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, category, message, details, sensitive);
    
    this.addToBuffer(entry);
    this.logToConsole(entry);
    
    // Send to remote logging service asynchronously
    this.logToRemote(entry).catch(error => {
      console.error('Remote logging failed:', error);
    });
  }

  /**
   * Log authentication errors
   */
  async logAuthError(
    message: string,
    error: any,
    context?: string,
    userId?: string
  ): Promise<void> {
    await this.log('error', 'auth', message, {
      errorCode: error?.code || error?.error_code,
      statusCode: error?.status,
      context,
      userId,
      originalError: this.config.environment === 'development' ? error : undefined,
      stack: this.config.environment === 'development' ? error?.stack : undefined,
    }, true);
  }

  /**
   * Log configuration errors
   */
  async logConfigError(
    message: string,
    configDetails?: any,
    context?: string
  ): Promise<void> {
    await this.log('error', 'config', message, {
      context,
      configDetails: this.config.environment === 'development' ? configDetails : undefined,
    });
  }

  /**
   * Log network errors
   */
  async logNetworkError(
    message: string,
    error: any,
    endpoint?: string,
    context?: string
  ): Promise<void> {
    await this.log('error', 'network', message, {
      errorCode: error?.code,
      statusCode: error?.status,
      endpoint,
      context,
      networkError: this.config.environment === 'development' ? error : undefined,
    });
  }

  /**
   * Log validation errors
   */
  async logValidationError(
    message: string,
    validationDetails?: any,
    context?: string
  ): Promise<void> {
    await this.log('warn', 'validation', message, {
      context,
      validationDetails,
    });
  }

  /**
   * Log session events
   */
  async logSessionEvent(
    message: string,
    sessionId?: string,
    userId?: string,
    context?: string
  ): Promise<void> {
    await this.log('info', 'session', message, {
      sessionId,
      userId,
      context,
    });
  }

  /**
   * Log debug information
   */
  async logDebug(
    message: string,
    details?: any,
    context?: string
  ): Promise<void> {
    await this.log('debug', 'auth', message, {
      context,
      debugDetails: details,
    });
  }

  /**
   * Get recent logs from buffer
   */
  getRecentLogs(count = 10): AuthLogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Get logger configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Update logger configuration
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
const authLogger = new AuthLogger();

export { authLogger, AuthLogger };
export default authLogger;