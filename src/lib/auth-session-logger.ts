/**
 * Session-specific logging utilities for authentication events
 */

import authLogger from './auth-logger';
import { User, Session } from '@supabase/supabase-js';

export interface SessionEventContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  previousSession?: boolean;
}

/**
 * Logs session creation events
 */
export async function logSessionCreated(
  user: User,
  session: Session,
  context?: Partial<SessionEventContext>
): Promise<void> {
  await authLogger.logSessionEvent(
    `User session created successfully`,
    session.access_token.substring(0, 8) + '...', // Partial token for identification
    user.id,
    'session_created'
  );

  // Log additional session details in development
  if (process.env.NODE_ENV === 'development') {
    await authLogger.logDebug(
      'Session creation details',
      {
        userEmail: user.email,
        sessionExpiry: session.expires_at,
        provider: user.app_metadata?.provider,
        lastSignIn: user.last_sign_in_at,
        ...context
      },
      'session_created_debug'
    );
  }
}

/**
 * Logs session destruction events
 */
export async function logSessionDestroyed(
  userId?: string,
  sessionId?: string,
  reason: 'user_logout' | 'session_expired' | 'forced_logout' | 'error' = 'user_logout',
  context?: Partial<SessionEventContext>
): Promise<void> {
  await authLogger.logSessionEvent(
    `User session destroyed: ${reason}`,
    sessionId,
    userId,
    'session_destroyed'
  );

  if (reason === 'error' || reason === 'forced_logout') {
    await authLogger.logAuthError(
      `Session destroyed due to ${reason}`,
      { reason, ...context },
      'session_destruction',
      userId
    );
  }
}

/**
 * Logs session validation events
 */
export async function logSessionValidation(
  isValid: boolean,
  userId?: string,
  sessionId?: string,
  error?: any,
  context?: Partial<SessionEventContext>
): Promise<void> {
  if (isValid) {
    await authLogger.logSessionEvent(
      'Session validation successful',
      sessionId,
      userId,
      'session_validation'
    );
  } else {
    await authLogger.logAuthError(
      'Session validation failed',
      error,
      'session_validation_failed',
      userId
    );
  }
}

/**
 * Logs session refresh events
 */
export async function logSessionRefresh(
  success: boolean,
  userId?: string,
  sessionId?: string,
  error?: any,
  context?: Partial<SessionEventContext>
): Promise<void> {
  if (success) {
    await authLogger.logSessionEvent(
      'Session refreshed successfully',
      sessionId,
      userId,
      'session_refresh'
    );
  } else {
    await authLogger.logAuthError(
      'Session refresh failed',
      error,
      'session_refresh_failed',
      userId
    );
  }
}

/**
 * Logs authentication attempts
 */
export async function logAuthAttempt(
  email: string,
  success: boolean,
  error?: any,
  context?: Partial<SessionEventContext>
): Promise<void> {
  const maskedEmail = email.replace(/(.{1})(.*)(@.*)/, '$1***$3');
  
  if (success) {
    await authLogger.logSessionEvent(
      `Authentication successful for ${maskedEmail}`,
      undefined,
      undefined,
      'auth_attempt_success'
    );
  } else {
    await authLogger.logAuthError(
      `Authentication failed for ${maskedEmail}`,
      error,
      'auth_attempt_failed'
    );
  }
}

/**
 * Logs password reset events
 */
export async function logPasswordReset(
  email: string,
  success: boolean,
  error?: any,
  context?: Partial<SessionEventContext>
): Promise<void> {
  const maskedEmail = email.replace(/(.{1})(.*)(@.*)/, '$1***$3');
  
  if (success) {
    await authLogger.logSessionEvent(
      `Password reset requested for ${maskedEmail}`,
      undefined,
      undefined,
      'password_reset_requested'
    );
  } else {
    await authLogger.logAuthError(
      `Password reset failed for ${maskedEmail}`,
      error,
      'password_reset_failed'
    );
  }
}

/**
 * Logs suspicious authentication activity
 */
export async function logSuspiciousActivity(
  description: string,
  userId?: string,
  sessionId?: string,
  details?: any,
  context?: Partial<SessionEventContext>
): Promise<void> {
  await authLogger.logAuthError(
    `Suspicious activity detected: ${description}`,
    details,
    'suspicious_activity',
    userId
  );
}

/**
 * Logs configuration-related authentication issues
 */
export async function logConfigurationIssue(
  issue: string,
  configDetails?: any,
  context?: Partial<SessionEventContext>
): Promise<void> {
  await authLogger.logConfigError(
    `Authentication configuration issue: ${issue}`,
    configDetails,
    'auth_config_issue'
  );
}

/**
 * Gets session logging statistics (for debugging)
 */
export function getSessionLoggingStats(): {
  recentLogs: any[];
  loggerConfig: any;
} {
  return {
    recentLogs: authLogger.getRecentLogs(20),
    loggerConfig: authLogger.getConfig()
  };
}

export default {
  logSessionCreated,
  logSessionDestroyed,
  logSessionValidation,
  logSessionRefresh,
  logAuthAttempt,
  logPasswordReset,
  logSuspiciousActivity,
  logConfigurationIssue,
  getSessionLoggingStats
};