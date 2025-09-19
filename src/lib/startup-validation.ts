/**
 * Startup validation utilities
 * Runs environment validation when the application starts
 */

import { assertValidEnvironmentConfig, assertValidProductionEnvironment, validateEnvironmentForCurrentStage } from './env-validator';

let validationRun = false;

/**
 * Runs startup validation once per application lifecycle
 * This should be called early in the application startup process
 */
export function runStartupValidation(): void {
  // Only run validation once to avoid multiple calls
  if (validationRun) {
    return;
  }

  try {
    console.log('🔍 Running startup environment validation...');
    
    // Use stage-appropriate validation
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.log('🏭 Production environment detected - running enhanced validation...');
      assertValidProductionEnvironment();
    } else {
      console.log('🛠️  Development environment detected - running standard validation...');
      assertValidEnvironmentConfig();
    }
    
    console.log('✅ Environment validation passed');
    validationRun = true;
  } catch (error) {
    console.error('❌ Startup validation failed:');
    console.error(error instanceof Error ? error.message : String(error));
    
    // In development, we want to see the error clearly
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    
    // In production, we still throw but with a more generic message
    throw new Error('Application configuration error. Please check environment variables.');
  }
}

/**
 * Validates environment configuration for server-side usage
 * This can be used in API routes or server components
 */
export function validateServerEnvironment(): void {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      assertValidProductionEnvironment();
    } else {
      assertValidEnvironmentConfig();
    }
  } catch (error) {
    console.error('Server environment validation failed:', error);
    throw error;
  }
}

/**
 * Gets validation results without throwing errors
 * Useful for health checks or diagnostic endpoints
 */
export function getEnvironmentValidationStatus() {
  const validation = validateEnvironmentForCurrentStage();
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };
}