'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginDebug() {
  const [email, setEmail] = useState('sofia.ribeiro@hrvision.com');
  const [password, setPassword] = useState('Senha@123');
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const testConnection = async () => {
    setIsLoading(true);
    setDebugInfo({});

    try {
      // 1. Verificar variáveis de ambiente
      const envCheck = {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
      };

      // 2. Testar conexão básica
      const { data: healthCheck, error: healthError } = await supabase
        .from('employees')
        .select('count')
        .limit(1);

      // 3. Testar autenticação
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setDebugInfo({
        environment: envCheck,
        healthCheck: {
          success: !healthError,
          error: healthError?.message,
          data: healthCheck
        },
        authentication: {
          success: !authError,
          error: authError?.message,
          errorCode: authError?.status,
          user: authData?.user?.email,
          session: !!authData?.session
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      setDebugInfo({
        error: 'Erro inesperado',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Debug de Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={testConnection} disabled={isLoading} className="w-full">
          {isLoading ? 'Testando...' : 'Testar Conexão e Login'}
        </Button>

        {debugInfo && Object.keys(debugInfo).length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Resultado do Debug:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
