import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

/**
 * Creates a simple Supabase client with fallbacks for build time
 */
export function createClient() {
  // Get environment variables with fallbacks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || 'placeholder-key';

  // Basic validation only in development
  if (process.env.NODE_ENV === 'development') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL not set');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
    }
  }

  try {
    const client = createBrowserClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Supabase client created successfully');
    }

    return client;
  } catch (error: any) {
    console.error('❌ Failed to create Supabase client:', error.message);
    
    // Return a basic client even if there are issues
    return createBrowserClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
  
  return {
    hasUrl: !!url,
    hasAnonKey: !!key,
    urlValid: (() => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    })(),
    canCreateClient: canCreateSupabaseClient(),
  };
}
