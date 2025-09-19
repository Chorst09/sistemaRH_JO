/**
 * Environment Configuration Validator
 * Validates Supabase configuration and required environment variables
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EnvironmentConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

/**
 * Validates if a URL follows the correct Supabase format
 */
function isValidSupabaseUrl(url: string): boolean {
  if (!url) return false;
  
  // Supabase URLs should follow the pattern: https://[project-ref].supabase.co
  const supabaseUrlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/?$/;
  return supabaseUrlPattern.test(url);
}

/**
 * Validates if the anon key follows JWT format
 */
function isValidSupabaseAnonKey(key: string): boolean {
  if (!key) return false;
  
  // JWT tokens have 3 parts separated by dots
  const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  return jwtPattern.test(key);
}

/**
 * Validates the Supabase configuration
 */
export function validateSupabaseConfig(config: SupabaseConfig): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate URL
  if (!config.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  } else if (!isValidSupabaseUrl(config.url)) {
    errors.push(
      `Invalid Supabase URL format: "${config.url}". ` +
      'Expected format: https://[project-ref].supabase.co'
    );
    
    // Check for common mistakes
    if (config.url.includes('vercel.app')) {
      errors.push(
        'Supabase URL appears to be a Vercel deployment URL. ' +
        'Use your Supabase project URL instead.'
      );
    }
  }

  // Validate anon key
  if (!config.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  } else if (!isValidSupabaseAnonKey(config.anonKey)) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY does not appear to be a valid JWT token');
  }

  // Check if URL and key seem to match (basic validation)
  if (config.url && config.anonKey && isValidSupabaseUrl(config.url) && isValidSupabaseAnonKey(config.anonKey)) {
    try {
      // Extract project ref from URL
      const urlMatch = config.url.match(/https:\/\/([a-zA-Z0-9-]+)\.supabase\.co/);
      if (urlMatch) {
        const projectRef = urlMatch[1];
        
        // Decode JWT payload (without verification, just for project ref check)
        const payload = JSON.parse(atob(config.anonKey.split('.')[1]));
        
        if (payload.ref && payload.ref !== projectRef) {
          warnings.push(
            `Project reference mismatch: URL contains "${projectRef}" but token contains "${payload.ref}"`
          );
        }
      }
    } catch (error) {
      // If we can't decode the JWT, it's likely invalid
      errors.push('Unable to decode NEXT_PUBLIC_SUPABASE_ANON_KEY - token may be malformed');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates environment variables at runtime
 */
export function validateEnvironmentConfig(): ConfigValidationResult {
  const config: SupabaseConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  };

  return validateSupabaseConfig(config);
}

/**
 * Throws an error if environment configuration is invalid
 * Should be called during application startup
 */
export function assertValidEnvironmentConfig(): void {
  const validation = validateEnvironmentConfig();
  
  if (!validation.isValid) {
    const errorMessage = [
      'Invalid Supabase configuration detected:',
      ...validation.errors.map(error => `  - ${error}`),
      '',
      'Please check your environment variables and ensure they are correctly configured.',
      'See .env.example for the expected format.'
    ].join('\n');
    
    throw new Error(errorMessage);
  }
  
  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Supabase configuration warnings:');
    validation.warnings.forEach(warning => {
      console.warn(`  - ${warning}`);
    });
  }
}

/**
 * Validates production-specific environment requirements
 */
export function validateProductionEnvironment(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // First run standard validation
  const standardValidation = validateEnvironmentConfig();
  errors.push(...standardValidation.errors);
  warnings.push(...standardValidation.warnings);
  
  // Production-specific checks
  const isProduction = process.env.NODE_ENV === 'production';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (isProduction) {
    // Check for placeholder values in production
    if (supabaseUrl.includes('your-project-ref') || supabaseUrl.includes('example')) {
      errors.push(
        'Production environment detected but NEXT_PUBLIC_SUPABASE_URL contains placeholder values. ' +
        'Please set the actual Supabase project URL.'
      );
    }
    
    if (anonKey.includes('your-supabase-anon-key') || anonKey.includes('example')) {
      errors.push(
        'Production environment detected but NEXT_PUBLIC_SUPABASE_ANON_KEY contains placeholder values. ' +
        'Please set the actual Supabase anon key.'
      );
    }
    
    // Check for development/localhost URLs in production
    if (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1')) {
      errors.push(
        'Production environment should not use localhost URLs for Supabase. ' +
        'Use your production Supabase project URL.'
      );
    }
    
    // Warn about missing service role key in production (if server-side features are used)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      warnings.push(
        'SUPABASE_SERVICE_ROLE_KEY is not set. This may be required for server-side operations in production.'
      );
    }
    
    // Warn about missing JWT secret
    if (!process.env.SUPABASE_JWT_SECRET) {
      warnings.push(
        'SUPABASE_JWT_SECRET is not set. This may be required for JWT verification in production.'
      );
    }
  } else {
    // Development environment checks
    if (supabaseUrl.includes('your-project-ref') || anonKey.includes('your-supabase-anon-key')) {
      warnings.push(
        'Development environment detected with placeholder values. ' +
        'Make sure to set actual Supabase credentials for testing.'
      );
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates environment based on the current NODE_ENV
 */
export function validateEnvironmentForCurrentStage(): ConfigValidationResult {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return validateProductionEnvironment();
  } else {
    return validateEnvironmentConfig();
  }
}

/**
 * Throws an error if production environment configuration is invalid
 */
export function assertValidProductionEnvironment(): void {
  const validation = validateProductionEnvironment();
  
  if (!validation.isValid) {
    const errorMessage = [
      'Invalid production environment configuration:',
      ...validation.errors.map(error => `  - ${error}`),
      '',
      'Production environments require properly configured Supabase credentials.',
      'Please check your environment variables and deployment configuration.'
    ].join('\n');
    
    throw new Error(errorMessage);
  }
  
  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Production environment warnings:');
    validation.warnings.forEach(warning => {
      console.warn(`  - ${warning}`);
    });
  }
}

/**
 * Gets the current environment configuration with validation
 */
export function getValidatedEnvironmentConfig(): EnvironmentConfig {
  assertValidEnvironmentConfig();
  
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  };
}

/**
 * Gets environment configuration with stage-appropriate validation
 */
export function getValidatedEnvironmentConfigForStage(): EnvironmentConfig {
  const validation = validateEnvironmentForCurrentStage();
  
  if (!validation.isValid) {
    const errorMessage = [
      `Invalid ${process.env.NODE_ENV || 'development'} environment configuration:`,
      ...validation.errors.map(error => `  - ${error}`),
      '',
      'Please check your environment variables configuration.'
    ].join('\n');
    
    throw new Error(errorMessage);
  }
  
  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn(`${process.env.NODE_ENV || 'development'} environment warnings:`);
    validation.warnings.forEach(warning => {
      console.warn(`  - ${warning}`);
    });
  }
  
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  };
}