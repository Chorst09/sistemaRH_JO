'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
// Remove debug component completely for production build

export default function DebugPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)
      },
      tests: {} as any
    };

    // Teste 1: Conexão básica
    try {
      const { data, error } = await supabase.from('employees').select('count').limit(1);
      diagnostic.tests.connection = { success: !error, error: error?.message, data };
    } catch (e) {
      diagnostic.tests.connection = { success: false, error: String(e) };
    }

    // Teste 2: Listar usuários existentes (se possível)
    try {
      const { data: users, error } = await supabase.auth.admin.listUsers();
      diagnostic.tests.listUsers = { success: !error, count: users?.users?.length, error: error?.message };
    } catch (e) {
      diagnostic.tests.listUsers = { success: false, error: 'Admin access not available' };
    }

    // Teste 3: Tentar login com diferentes usuários
    const testUsers = [
      { email: 'sofia.ribeiro@hrvision.com', password: 'Senha@123' },
      { email: 'admin@hrvision.com', password: '123456' },
      { email: 'josealexandre@gmail.com', password: '123456' },
      { email: 'chorstconsult@gmail.com', password: '123456' }
    ];

    diagnostic.tests.loginAttempts = [];

    for (const user of testUsers) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword(user);
        diagnostic.tests.loginAttempts.push({
          email: user.email,
          success: !error,
          error: error?.message,
          status: (error as any)?.status,
          hasUser: !!data?.user,
          hasSession: !!data?.session
        });
        
        // Se logou com sucesso, fazer logout imediatamente
        if (!error) {
          await supabase.auth.signOut();
        }
      } catch (e) {
        diagnostic.tests.loginAttempts.push({
          email: user.email,
          success: false,
          error: String(e)
        });
      }
    }

    setResult(diagnostic);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">🔍 Diagnóstico Supabase</h1>
      
      <button 
        onClick={runDiagnostic}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {loading ? 'Executando diagnóstico...' : 'Executar Diagnóstico Completo'}
      </button>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Resultado:</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Authentication Logging Debug Panel - Removido para produção */}
      {/* <AuthLoggingDebug /> */}
    </div>
  );
}
