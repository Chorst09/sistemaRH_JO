import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { getValidatedEnvironmentConfig } from './env-validator';
import { handleAuthError } from './auth-error-handler';

interface SupabaseClientConfig {
  url: string;
  anonKey: string;
  options?: {
    auth?: {
      persistSession?: boolean;
      autoRefreshToken?: boolean;
      detectSessionInUrl?: boolean;
    };
  };
}

/**
 * Validates Supabase configuration before creating client
 */
function validateSupabaseConfig(url: string, anonKey: string): void {
  if (!url || typeof url !== 'string') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required and must be a valid string');
  }

  if (!anonKey || typeof anonKey !== 'string') {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required and must be a valid string');
  }

  // Validate URL format
  try {
    const parsedUrl = new URL(url);
    
    // Check if it's a valid Supabase URL format
    if (!parsedUrl.hostname.includes('supabase')) {
      console.warn('⚠️ URL does not appear to be a Supabase URL:', parsedUrl.hostname);
    }
    
    // Check protocol
    if (parsedUrl.protocol !== 'https:') {
      console.warn('⚠️ Supabase URL should use HTTPS protocol');
    }
  } catch (error) {
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL format: ${url}`);
  }

  // Basic validation for anon key format (should be a JWT-like string)
  if (anonKey.length < 100 || !anonKey.includes('.')) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid format');
  }
}

/**
 * Gets default Supabase client options
 */
function getDefaultClientOptions(): SupabaseClientConfig['options'] {
  return {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  };
}

/**
 * Creates a centralized Supabase client with validation and error handling
 */
export function createClient() {
  try {
    // Get validated environment configuration
    const config = getValidatedEnvironmentConfig();
    
    // Additional validation specific to Supabase
    validateSupabaseConfig(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Create client with default options
    const client = createBrowserClient<Database>(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      getDefaultClientOptions()
    );

    // Log successful client creation in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Supabase client created successfully');
    }

    return client;
  } catch (error: any) {
    // Handle configuration errors with structured error handling
    const structuredError = handleAuthError(error, {
      context: 'supabase_client_creation',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });

    // In case of configuration errors, we can't create a client
    // This will cause authentication to fail gracefully
    console.error('❌ Failed to create Supabase client:', structuredError.message);
    
    // Re-throw the error so calling code can handle it appropriately
    throw new Error(`Supabase client configuration error: ${structuredError.userMessage}`);
  }
}

/**
 * Creates a Supabase client with custom options
 */
export function createClientWithOptions(customOptions: SupabaseClientConfig['options']) {
  try {
    const config = getValidatedEnvironmentConfig();
    validateSupabaseConfig(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Merge custom options with defaults
    const defaultOptions = getDefaultClientOptions();
    const options = {
      ...defaultOptions,
      ...customOptions,
      auth: {
        ...defaultOptions?.auth,
        ...customOptions?.auth,
      },
    };

    return createBrowserClient<Database>(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      options
    );
  } catch (error: any) {
    const structuredError = handleAuthError(error, {
      context: 'supabase_client_creation_with_options',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });

    console.error('❌ Failed to create Supabase client with options:', structuredError.message);
    throw new Error(`Supabase client configuration error: ${structuredError.userMessage}`);
  }
}

/**
 * Checks if Supabase client can be created (for health checks)
 */
export function canCreateSupabaseClient(): boolean {
  try {
    createClient();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets Supabase configuration status for debugging
 */
export function getSupabaseConfigStatus() {
  try {
    const config = getValidatedEnvironmentConfig();
    
    return {
      hasUrl: !!config.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlValid: (() => {
        try {
          new URL(config.NEXT_PUBLIC_SUPABASE_URL);
          return true;
        } catch {
          return false;
        }
      })(),
      canCreateClient: canCreateSupabaseClient(),
    };
  } catch (error) {
    return {
      hasUrl: false,
      hasAnonKey: false,
      urlValid: false,
      canCreateClient: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}