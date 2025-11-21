import { AuthError } from '@supabase/supabase-js';
import authLogger from './auth-logger';

export interface StructuredAuthError {
  code: string;
  message: string;
  userMessage: string;
  details?: any;
  timestamp: string;
  type: 'config' | 'auth' | 'network' | 'validation';
  statusCode?: number;
}

export interface AuthErrorLogEntry {
  timestamp: string;
  error_type: 'config' | 'auth' | 'network' | 'validation';
  message: string;
  status_code?: number;
  user_agent?: string;
  url?: string;
  details?: any;
}

/**
 * Maps Supabase auth errors to user-friendly messages
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  'invalid_credentials': 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
  'email_not_confirmed': 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.',
  'too_many_requests': 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.',
  'signup_disabled': 'Cadastro de novos usuários está desabilitado.',
  'invalid_request': 'Requisição inválida. Verifique os dados informados.',
  'network_error': 'Erro de conexão. Verifique sua internet e tente novamente.',
  'server_error': 'Erro interno do servidor. Tente novamente em alguns minutos.',
  'configuration_error': 'Erro de configuração do sistema. Entre em contato com o suporte.',
  'session_expired': 'Sua sessão expirou. Faça login novamente.',
  'user_not_found': 'Usuário não encontrado. Verifique o e-mail informado.',
  'weak_password': 'A senha deve ter pelo menos 6 caracteres.',
  'email_address_invalid': 'Formato de e-mail inválido.',
};

/**
 * Determines error type based on error characteristics
 */
function determineErrorType(error: any): StructuredAuthError['type'] {
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return 'network';
  }
  
  if (error?.status >= 500) {
    return 'network';
  }
  
  if (error?.message?.includes('Invalid URL') || error?.message?.includes('SUPABASE_URL')) {
    return 'config';
  }
  
  if (error?.status === 400 && error?.message?.includes('Invalid request')) {
    return 'validation';
  }
  
  return 'auth';
}

/**
 * Gets user-friendly message for error
 */
function getUserMessage(error: any, errorType: StructuredAuthError['type']): string {
  // Check for specific error messages first
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
      return ERROR_MESSAGE_MAP.invalid_credentials;
    }
    
    if (message.includes('email not confirmed')) {
      return ERROR_MESSAGE_MAP.email_not_confirmed;
    }
    
    if (message.includes('too many requests')) {
      return ERROR_MESSAGE_MAP.too_many_requests;
    }
    
    if (message.includes('signup is disabled')) {
      return ERROR_MESSAGE_MAP.signup_disabled;
    }
    
    if (message.includes('invalid url') || message.includes('supabase_url')) {
      return ERROR_MESSAGE_MAP.configuration_error;
    }
    
    if (message.includes('user not found')) {
      return ERROR_MESSAGE_MAP.user_not_found;
    }
    
    if (message.includes('weak password')) {
      return ERROR_MESSAGE_MAP.weak_password;
    }
    
    if (message.includes('invalid email')) {
      return ERROR_MESSAGE_MAP.email_address_invalid;
    }
  }
  
  // Fallback based on status code
  if (error?.status) {
    switch (error.status) {
      case 400:
        return ERROR_MESSAGE_MAP.invalid_request;
      case 401:
        return ERROR_MESSAGE_MAP.invalid_credentials;
      case 422:
        return ERROR_MESSAGE_MAP.email_address_invalid;
      case 429:
        return ERROR_MESSAGE_MAP.too_many_requests;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGE_MAP.server_error;
      default:
        break;
    }
  }
  
  // Fallback based on error type
  switch (errorType) {
    case 'network':
      return ERROR_MESSAGE_MAP.network_error;
    case 'config':
      return ERROR_MESSAGE_MAP.configuration_error;
    case 'validation':
      return ERROR_MESSAGE_MAP.invalid_request;
    default:
      return 'Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.';
  }
}

/**
 * Processes and structures authentication errors
 */
export function processAuthError(error: any): StructuredAuthError {
  const timestamp = new Date().toISOString();
  const errorType = determineErrorType(error);
  const userMessage = getUserMessage(error, errorType);
  
  return {
    code: error?.error_code || error?.code || 'unknown_error',
    message: error?.message || 'Unknown error occurred',
    userMessage,
    details: {
      status: error?.status,
      statusText: error?.statusText,
      originalError: error,
    },
    timestamp,
    type: errorType,
    statusCode: error?.status,
  };
}

/**
 * Logs authentication errors with comprehensive structured logging
 */
export async function logAuthError(structuredError: StructuredAuthError, context?: any): Promise<void> {
  // Use the comprehensive logging system based on error type
  switch (structuredError.type) {
    case 'config':
      await authLogger.logConfigError(
        structuredError.message,
        structuredError.details,
        context?.context || 'auth_error_handler'
      );
      break;
    
    case 'network':
      await authLogger.logNetworkError(
        structuredError.message,
        structuredError.details?.originalError,
        context?.url,
        context?.context || 'auth_error_handler'
      );
      break;
    
    case 'validation':
      await authLogger.logValidationError(
        structuredError.message,
        {
          code: structuredError.code,
          userMessage: structuredError.userMessage,
          context: context
        },
        context?.context || 'auth_error_handler'
      );
      break;
    
    case 'auth':
    default:
      await authLogger.logAuthError(
        structuredError.message,
        structuredError.details?.originalError,
        context?.context || 'auth_error_handler',
        context?.userId
      );
      break;
  }

  // Legacy logging for backward compatibility (can be removed later)
  const logEntry: AuthErrorLogEntry = {
    timestamp: structuredError.timestamp,
    error_type: structuredError.type,
    message: structuredError.message,
    status_code: structuredError.statusCode,
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    details: {
      code: structuredError.code,
      context,
      // In production, we should mask sensitive information
      ...(process.env.NODE_ENV === 'development' ? structuredError.details : {}),
    },
  };
  
  // Simplified console logging since comprehensive logging is handled by authLogger
  if (process.env.NODE_ENV === 'development') {
    console.group('🔄 Legacy Auth Error Log');
    console.log('This will be deprecated in favor of the new logging system');
    console.log('Legacy Entry:', logEntry);
    console.groupEnd();
  }
}

/**
 * Handles authentication errors with comprehensive logging and user feedback
 */
export function handleAuthError(error: any, context?: any): StructuredAuthError {
  const structuredError = processAuthError(error);
  
  // Log asynchronously to avoid blocking the UI
  logAuthError(structuredError, context).catch(logError => {
    console.error('Failed to log auth error:', logError);
  });
  
  return structuredError;
}

/**
 * Validates authentication input and returns validation errors
 */
export function validateAuthInput(email: string, password: string): StructuredAuthError | null {
  const timestamp = new Date().toISOString();
  
  if (!email || !email.trim()) {
    return {
      code: 'email_required',
      message: 'Email is required',
      userMessage: 'Por favor, informe seu e-mail.',
      timestamp,
      type: 'validation',
    };
  }
  
  if (!password || !password.trim()) {
    return {
      code: 'password_required',
      message: 'Password is required',
      userMessage: 'Por favor, informe sua senha.',
      timestamp,
      type: 'validation',
    };
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      code: 'email_invalid_format',
      message: 'Invalid email format',
      userMessage: ERROR_MESSAGE_MAP.email_address_invalid,
      timestamp,
      type: 'validation',
    };
  }
  
  if (password.length < 6) {
    return {
      code: 'password_too_short',
      message: 'Password too short',
      userMessage: ERROR_MESSAGE_MAP.weak_password,
      timestamp,
      type: 'validation',
    };
  }
  
  return null;
}