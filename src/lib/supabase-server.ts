import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase';
import { getValidatedEnvironmentConfig } from './env-validator';
import { handleAuthError } from './auth-error-handler';



/**
 * Validates server-side Supabase configuration
 */
function validateServerSupabaseConfig(url: string, anonKey: string): void {
  if (!url || typeof url !== 'string') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for server-side client');
  }

  if (!anonKey || typeof anonKey !== 'string') {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required for server-side client');
  }

  // Validate URL format
  try {
    const parsedUrl = new URL(url);
    
    if (!parsedUrl.hostname.includes('supabase')) {
      console.warn('⚠️ Server URL does not appear to be a Supabase URL:', parsedUrl.hostname);
    }
    
    if (parsedUrl.protocol !== 'https:') {
      console.warn('⚠️ Server Supabase URL should use HTTPS protocol');
    }
  } catch (error) {
    throw new Error(`Invalid server NEXT_PUBLIC_SUPABASE_URL format: ${url}`);
  }
}

/**
 * Creates a server-side Supabase client for middleware
 */
export function createServerClientForMiddleware(request: NextRequest, response: NextResponse) {
  try {
    const config = getValidatedEnvironmentConfig();
    
    validateServerSupabaseConfig(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    return createSupabaseServerClient<Database>(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set(name, value, {
              domain: options.domain,
              path: options.path,
              maxAge: options.maxAge,
              httpOnly: options.httpOnly,
              sameSite: options.sameSite,
              secure: options.secure,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.delete(name);
          },
        },
      }
    );
  } catch (error: any) {
    const structuredError = handleAuthError(error, {
      context: 'server_client_creation_middleware',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });

    console.error('❌ Failed to create server Supabase client:', structuredError.message);
    throw new Error(`Server Supabase client configuration error: ${structuredError.userMessage}`);
  }
}

/**
 * Creates a server-side Supabase client for API routes and server components
 */
export function createServerClient(cookies: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: CookieOptions) => void;
  remove: (name: string, options?: CookieOptions) => void;
}) {
  try {
    const config = getValidatedEnvironmentConfig();
    
    validateServerSupabaseConfig(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    return createSupabaseServerClient<Database>(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies,
      }
    );
  } catch (error: any) {
    const structuredError = handleAuthError(error, {
      context: 'server_client_creation_api',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });

    console.error('❌ Failed to create server Supabase client:', structuredError.message);
    throw new Error(`Server Supabase client configuration error: ${structuredError.userMessage}`);
  }
}

/**
 * Checks if server-side Supabase client can be created
 */
export function canCreateServerSupabaseClient(): boolean {
  try {
    const config = getValidatedEnvironmentConfig();
    validateServerSupabaseConfig(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets server-side Supabase configuration status
 */
export function getServerSupabaseConfigStatus() {
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
      canCreateClient: canCreateServerSupabaseClient(),
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