# Authentication Logging System

## Overview

A comprehensive authentication error logging system has been implemented to provide structured logging for authentication errors with environment-specific behavior and sensitive data masking.

## Features Implemented

### 1. Structured Logging (`src/lib/auth-logger.ts`)
- **Comprehensive log entry structure** with timestamps, levels, categories, and details
- **Environment-specific configuration** (development vs production)
- **Sensitive data masking** in production environments
- **Log level filtering** (debug, info, warn, error)
- **Buffer management** with configurable size limits
- **Multiple log categories**: auth, config, network, validation, session

### 2. Environment Configuration (`src/lib/auth-logging-config.ts`)
- **Environment-specific settings** for different deployment stages
- **Sensitive data patterns** configuration
- **Remote logging service integration** (Sentry, LogRocket, DataDog, etc.)
- **Log retention policies** per environment
- **Feature flags** for logging functionality

### 3. Session Logging (`src/lib/auth-session-logger.ts`)
- **Session lifecycle tracking** (creation, validation, refresh, destruction)
- **Authentication attempt logging** with masked email addresses
- **Password reset event logging**
- **Suspicious activity detection**
- **Configuration issue tracking**

### 4. Error Handling Integration (`src/lib/auth-error-handler.ts`)
- **Structured error processing** with user-friendly messages
- **Error type classification** (config, auth, network, validation)
- **Portuguese error messages** for user interface
- **Input validation** with detailed error reporting
- **Integration with logging system**

### 5. Debug Panel (`src/components/debug/auth-logging-debug.tsx`)
- **Real-time log monitoring** (development only)
- **Interactive log testing** with manual triggers
- **Configuration inspection** and validation
- **Log buffer management** interface

## Integration Points

### Authentication Components
- **Login page** (`src/app/(auth)/login/page.tsx`) - Full logging integration
- **Auth hook** (`src/hooks/use-auth.ts`) - Session state change logging
- **Supabase client** (`src/lib/supabase-client.ts`) - Configuration error logging

### Environment-Specific Behavior

#### Development Mode
- **Detailed console logging** with formatted output
- **Full error details** including stack traces
- **No sensitive data masking**
- **Debug log level** enabled
- **Interactive debug panel** available

#### Production Mode
- **Minimal console output** (errors only)
- **Remote logging service** integration
- **Sensitive data masking** enabled
- **Error log level** only
- **No debug panel** visible

## Security Features

### Sensitive Data Protection
- **Email masking**: `user@example.com` → `u***@example.com`
- **Token masking**: Full tokens replaced with `***MASKED***`
- **Password exclusion**: Never logged in any environment
- **Configurable patterns**: Customizable sensitive data detection

### Production Safety
- **Automatic masking** of sensitive information
- **Reduced log verbosity** to prevent information leakage
- **Remote logging** for centralized monitoring
- **Error-only logging** to minimize data exposure

## Usage Examples

### Basic Logging
```typescript
import authLogger from '@/lib/auth-logger';

// Log authentication error
await authLogger.logAuthError(
  'Login failed for user',
  error,
  'login_form',
  userId
);

// Log configuration issue
await authLogger.logConfigError(
  'Invalid Supabase URL format',
  { url: process.env.NEXT_PUBLIC_SUPABASE_URL }
);
```

### Session Logging
```typescript
import { logAuthAttempt, logSessionCreated } from '@/lib/auth-session-logger';

// Log authentication attempt
await logAuthAttempt(email, success, error, {
  userAgent: navigator.userAgent,
  location: window.location.href
});

// Log session creation
await logSessionCreated(user, session, {
  userAgent: navigator.userAgent
});
```

### Error Handling
```typescript
import { handleAuthError } from '@/lib/auth-error-handler';

try {
  // Authentication code
} catch (error) {
  const structuredError = handleAuthError(error, {
    context: 'login_form',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL
  });
  
  // Show user-friendly message
  toast({
    title: "Erro de autenticação",
    description: structuredError.userMessage,
    variant: "destructive"
  });
}
```

## Testing

### Automated Tests
- **Unit tests**: `src/lib/__tests__/auth-logger.test.ts`
- **Integration tests**: `src/lib/__tests__/auth-logging-integration.test.ts`
- **Test script**: `scripts/test-auth-logging-system.js`

### Manual Testing
1. Start development server: `npm run dev`
2. Navigate to `/login` and test authentication
3. Check browser console for structured logs
4. Visit `/debug` to see the logging debug panel
5. Test error scenarios (wrong credentials, network issues)
6. Verify production mode masking behavior

## Configuration

### Environment Variables
```bash
# Optional: Custom environment override
NEXT_PUBLIC_APP_ENV=staging

# Optional: Remote logging services
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_LOGROCKET_APP_ID=your_logrocket_id
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your_datadog_token

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_SESSION_TRACKING=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
```

### Custom Configuration
```typescript
import authLogger from '@/lib/auth-logger';

// Update logger configuration
authLogger.updateConfig({
  logLevel: 'info',
  maskSensitiveData: true,
  enableRemoteLogging: true
});
```

## Requirements Satisfied

✅ **Requirement 3.1**: Structured logging for authentication errors implemented  
✅ **Requirement 3.2**: Environment-specific logging with sensitive data masking  
✅ **Requirement 3.3**: Comprehensive error logging with detailed context  

## Future Enhancements

- **Real-time log streaming** to external services
- **Log analytics dashboard** for monitoring trends
- **Automated alerting** for critical authentication issues
- **Performance metrics** integration
- **User behavior tracking** (with privacy controls)