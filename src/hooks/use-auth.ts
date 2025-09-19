import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { handleAuthError } from '@/lib/auth-error-handler';
import { logSessionValidation, logSessionDestroyed, logSessionRefresh } from '@/lib/auth-session-logger';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Verifica a sessão atual de forma mais robusta
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          await logSessionValidation(false, undefined, undefined, error, {
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
          });
          handleAuthError(error, { context: 'use_auth_get_session' });
          setUser(null);
        } else {
          await logSessionValidation(
            !!session, 
            session?.user?.id, 
            session?.access_token?.substring(0, 8),
            undefined,
            {
              userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
            }
          );
          setUser(session?.user ?? null);
        }
      } catch (error) {
        await logSessionValidation(false, undefined, undefined, error, {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
        });
        handleAuthError(error, { context: 'use_auth_get_session_exception' });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escuta mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      // Log session state changes
      switch (event) {
        case 'SIGNED_IN':
          if (session?.user) {
            await logSessionValidation(true, session.user.id, session.access_token?.substring(0, 8));
          }
          break;
        case 'SIGNED_OUT':
          await logSessionDestroyed(
            session?.user?.id,
            session?.access_token?.substring(0, 8),
            'user_logout'
          );
          break;
        case 'TOKEN_REFRESHED':
          await logSessionRefresh(
            !!session,
            session?.user?.id,
            session?.access_token?.substring(0, 8)
          );
          break;
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Força refresh da página em mudanças críticas
      if (event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const signOut = async () => {
    const currentUser = user;
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        await logSessionDestroyed(
          currentUser?.id,
          undefined,
          'error',
          {
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
          }
        );
        handleAuthError(error, { context: 'use_auth_sign_out' });
      } else {
        await logSessionDestroyed(
          currentUser?.id,
          undefined,
          'user_logout',
          {
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
          }
        );
        setUser(null);
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      await logSessionDestroyed(
        currentUser?.id,
        undefined,
        'error',
        {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
        }
      );
      handleAuthError(error, { context: 'use_auth_sign_out_exception' });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signOut,
  };
}