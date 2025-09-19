'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { runStartupValidation } from '@/lib/startup-validation';
import type { User } from '@supabase/supabase-js';

type SupabaseContextType = {
  user: User | null;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
});

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Run environment validation on client-side startup
  useEffect(() => {
    try {
      runStartupValidation();
    } catch (error) {
      console.error('Environment validation failed:', error);
      // In development, we might want to show an error boundary
      // For now, we'll just log the error and continue
    }
  }, []);
  
  const supabase = createClient();

  useEffect(() => {
    // Verifica a sessão inicial
    const getInitialSession = async () => {
      try {
        // Apenas obtém a sessão atual - não chama getUser()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          setUser(null);
        } else {
          // Define o usuário baseado apenas na sessão
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Erro na verificação inicial de autenticação:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Configura o listener para mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      // Sempre define o usuário baseado na sessão do evento
      setUser(session?.user ?? null);
      setLoading(false);

      // Refresh apenas em eventos importantes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const value = {
    user,
    loading,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}