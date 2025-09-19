# Authentication Logging System

## Overview

The authentication logging system provides comprehensive, structured logging for all authentication-related events in the application. It includes environment-specific behavior, sensitive data masking, and multiple output channels.

## Features

- **Structured Logging**: All logs follow a consistent structure with metadata
- **Environment-Specific Behavior**: Different configurations for development, production, and test environments
- **Sensitive Data Masking**: Automatically masks sensitive information in production
- **Multiple Log Levels**: Debug, info, warn, and error levels with filtering
- **Category-Based Organization**: Logs are categorized by type (auth, config, network, validation, session)
- **Buffer Management**: Configurable log buffer with automatic size management
- **Remote Logging Support**: Ready for integration with external logging services
- **Debug Panel**: Development-only UI for monitoring logs in real-time

## Architecture

```
Application Events → Auth Logger → [Console Output, Remote Service, Buffer Storage]
                                ↓
                            Debug Panel (Dev Only)
```

## Usage

### Basic Logging

```typescript
import authLogger from '@/lib/auth-logger';

// Log authentication errors
await authLogger.logAuthError(
  'Login failed for user',
  error,
  'login_form',
  userId
);

// Log configuration issues
await authLogger.logConfigError(
  'Invalid Supabase URL',
  { url: process.env.NEXT_PUBLIC_SUPABASE_URL },
  'startup_validation'
);

// Log network errors
await authLogger.logNetworkError(
  'Failed to connect to auth service',
  error,
  '/api/auth/login',
  'authentication'
);

// Log validation errors
await authLogger.logValidationError(
  'Invalid email format',
  { email: userInput },
  'form_validation'
);

// Log session events
await authLogger.logSessionEvent(
  'User session created',
  sessionId,
  userId,
  'login_success'
);
```

### Session-Specific Logging

```typescript
import {
  logAuthAttempt,
  logSessionCreated,
  logSessionDestroyed,
  logSessionValidation
} from '@/lib/auth-session-logger';

// Log authentication attempts
await logAuthAttempt(email, success, error);

// Log session lifecycle events
await logSessionCreated(user, session);
await logSessionDestroyed(userId, sessionId, 'user_logout');
await logSessionValidation(isValid, userId, sessionId, error);
```

## Configuration

### Environment Variables

```bash
# Optional: Override environment for logging
NEXT_PUBLIC_APP_ENV=staging

# Optional: Enable/disable specific features
NEXT_PUBLIC_ENABLE_SESSION_TRACKING=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_LOGGING=false
NEXT_PUBLIC_ENABLE_USER_BEHAVIOR_TRACKING=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true

# Remote logging service configuration (choose one)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_LOGROCKET_APP_ID=your_logrocket_id
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your_datadog_token
NEXT_PUBLIC_CUSTOM_LOG_ENDPOINT=your_custom_endpoint
```

### Programmatic Configuration

```typescript
import { AuthLogger } from '@/lib/auth-logger';

const customLogger = new AuthLogger({
  environment: 'production',
  enableConsoleLogging: false,
  enableRemoteLogging: true,
  maskSensitiveData: true,
  logLevel: 'error'
});
```

## Environment-Specific Behavior

### Development
- **Console Logging**: Enabled with full details
- **Remote Logging**: Disabled by default
- **Sensitive Data Masking**: Disabled for easier debugging
- **Log Level**: Debug (all logs shown)
- **Debug Panel**: Available at `/debug`

### Production
- **Console Logging**: Disabled
- **Remote Logging**: Enabled (if configured)
- **Sensitive Data Masking**: Enabled
- **Log Level**: Error (only errors shown)
- **Debug Panel**: Hidden

### Test
- **Console Logging**: Disabled
- **Remote Logging**: Disabled
- **Sensitive Data Masking**: Enabled
- **Log Level**: Warn
- **Debug Panel**: Hidden

## Log Structure

Each log entry contains:

```typescript
{
  id: string;              // Unique identifier
  timestamp: string;       // ISO timestamp
  level: 'error' | 'warn' | 'info' | 'debug';
  category: 'auth' | 'config' | 'network' | 'validation' | 'session';
  message: string;         // Human-readable message
  details: {               // Additional context
    errorCode?: string;
    statusCode?: number;
    userAgent?: string;
    url?: string;
    context?: string;
    userId?: string;
    sessionId?: string;
    [key: string]: any;
  };
  environment: string;     // Environment where log was created
  sensitive: boolean;      // Whether entry contains sensitive data
}
```

## Sensitive Data Masking

The system automatically masks sensitive data based on environment:

### Development
- Minimal masking for debugging
- Only passwords and tokens masked

### Production
- Comprehensive masking
- Emails, phone numbers, addresses, names masked
- All authentication tokens masked

### Masking Examples

```typescript
// Original data
{
  email: "user@example.com",
  password: "secret123",
  token: "abc123xyz"
}

// Masked in production
{
  email: "u***@example.com",
  password: "***MASKED***",
  token: "***MASKED***"
}
```

## Debug Panel

In development mode, access the debug panel at `/debug` to:

- View recent logs in real-time
- Monitor logger configuration
- Test different log types
- Clear log buffer
- Inspect log details

## Integration with Existing Code

The logging system integrates with existing authentication components:

### Login Page
- Logs authentication attempts
- Logs session creation/validation
- Logs configuration errors

### Auth Hook
- Logs session state changes
- Logs logout events
- Logs session refresh attempts

### Error Handler
- Enhanced with comprehensive logging
- Maintains backward compatibility
- Adds structured error information

## Remote Logging Services

The system supports integration with popular logging services:

### Sentry
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### LogRocket
```bash
NEXT_PUBLIC_LOGROCKET_APP_ID=your-app-id
```

### DataDog
```bash
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your-token
NEXT_PUBLIC_DATADOG_SITE=datadoghq.com
```

### Custom Endpoint
```bash
NEXT_PUBLIC_CUSTOM_LOG_ENDPOINT=https://your-api.com/logs
NEXT_PUBLIC_CUSTOM_LOG_API_KEY=your-api-key
```

## Performance Considerations

- **Asynchronous Logging**: All logging operations are non-blocking
- **Buffer Management**: Automatic cleanup prevents memory leaks
- **Environment Optimization**: Production mode minimizes overhead
- **Selective Logging**: Log level filtering reduces noise

## Security Considerations

- **Sensitive Data Protection**: Automatic masking in production
- **No Password Logging**: Passwords never logged in any environment
- **Token Truncation**: Authentication tokens only partially logged
- **User Privacy**: Email addresses masked in production logs

## Troubleshooting

### Common Issues

1. **Logs not appearing in console**
   - Check `enableConsoleLogging` configuration
   - Verify log level settings

2. **Sensitive data visible in logs**
   - Ensure `maskSensitiveData` is enabled
   - Check environment configuration

3. **Remote logging not working**
   - Verify service configuration
   - Check network connectivity
   - Review service-specific setup

### Debug Commands

```typescript
// Get recent logs
const logs = authLogger.getRecentLogs(10);

// Get current configuration
const config = authLogger.getConfig();

// Clear log buffer
authLogger.clearBuffer();

// Test logging
await authLogger.logDebug('Test message', { test: true });
```

## Migration Guide

### From Existing Error Handler

The new system is backward compatible. Existing code using `handleAuthError` will automatically use the new logging system.

### Adding Logging to New Components

1. Import the logger:
```typescript
import authLogger from '@/lib/auth-logger';
```

2. Add appropriate logging calls:
```typescript
try {
  // Your authentication code
} catch (error) {
  await authLogger.logAuthError('Operation failed', error, 'component_name');
}
```

3. Use session logger for session events:
```typescript
import { logSessionCreated } from '@/lib/auth-session-logger';
await logSessionCreated(user, session);
```

## Best Practices

1. **Use Appropriate Log Levels**
   - Error: Authentication failures, configuration issues
   - Warn: Validation failures, deprecated usage
   - Info: Session events, successful operations
   - Debug: Detailed debugging information

2. **Provide Context**
   - Always include a context string
   - Add relevant metadata to details
   - Include user/session IDs when available

3. **Avoid Logging Sensitive Data**
   - Never log passwords directly
   - Be careful with personal information
   - Use masking for development debugging

4. **Performance Considerations**
   - Don't log in tight loops
   - Use appropriate log levels
   - Consider async nature of logging

## Future Enhancements

- **Log Aggregation**: Centralized log collection
- **Alerting**: Real-time error notifications
- **Analytics**: Authentication pattern analysis
- **Retention Policies**: Automatic log cleanup
- **Export Functionality**: Log data export for analysis