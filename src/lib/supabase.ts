import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { getValidatedEnvironmentConfig } from './env-validator';

// Get validated environment configuration
const config = getValidatedEnvironmentConfig();

export const supabase = createClient<Database>(
  config.NEXT_PUBLIC_SUPABASE_URL,
  config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web',
      },
    },
    realtime: {
      // Configuração para WebSocket
    },
  }
);