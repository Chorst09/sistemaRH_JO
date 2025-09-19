'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestSupabasePage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, success: boolean, data?: any, error?: any) => {
    const result = {
      test,
      success,
      data,
      error: error?.message || error,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [result, ...prev]);
  };

  const testEnvironmentVariables = () => {
    addResult('Environment Variables', true, {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET'
    });
  };

  const testSupabaseClient = async () => {
    try {
      const supabase = createClient();
      addResult('Supabase Client Creation', true, { client: 'Created successfully' });
      
      // Test basic connection
      const { data, error } = await supabase.from('companies').select('count').limit(1);
      
      if (error) {
        addResult('Database Connection', false, null, error);
      } else {
        addResult('Database Connection', true, { message: 'Connected successfully' });
      }
    } catch (error) {
      addResult('Supabase Client Creation', false, null, error);
    }
  };

  const testAuthentication = async () => {
    try {
      const supabase = createClient();
      
      // Test getting current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addResult('Get Session', false, null, sessionError);
      } else {
        addResult('Get Session', true, { 
          hasSession: !!sessionData.session,
          user: sessionData.session?.user?.email || 'No user'
        });
      }

      // Test login with the default credentials
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'sofia.ribeiro@hrvision.com',
        password: 'Senha@123'
      });

      if (loginError) {
        addResult('Test Login', false, null, loginError);
      } else {
        addResult('Test Login', true, { 
          user: loginData.user?.email,
          hasSession: !!loginData.session
        });
      }
    } catch (error) {
      addResult('Authentication Test', false, null, error);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    testEnvironmentVariables();
    await testSupabaseClient();
    await testAuthentication();
    
    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Teste de Conexão Supabase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runAllTests} disabled={isLoading}>
              {isLoading ? 'Testando...' : 'Executar Todos os Testes'}
            </Button>
            <Button onClick={testEnvironmentVariables} variant="outline">
              Testar Variáveis
            </Button>
            <Button onClick={testSupabaseClient} variant="outline">
              Testar Cliente
            </Button>
            <Button onClick={testAuthentication} variant="outline">
              Testar Auth
            </Button>
            <Button onClick={clearResults} variant="outline">
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Resultados dos Testes</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum teste executado ainda. Clique em "Executar Todos os Testes" para começar.
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? '✅ SUCESSO' : '❌ ERRO'}
                    </Badge>
                    <span className="font-medium">{result.test}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {result.timestamp}
                    </span>
                  </div>
                  
                  {result.data && (
                    <div>
                      <p className="text-sm font-medium text-green-600">Dados:</p>
                      <pre className="text-xs bg-green-50 p-2 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.error && (
                    <div>
                      <p className="text-sm font-medium text-red-600">Erro:</p>
                      <pre className="text-xs bg-red-50 p-2 rounded overflow-auto">
                        {JSON.stringify(result.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
