'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { testSupabaseConnection, testAuthFlow } from '@/lib/test-auth';
import { testCompanyCreation, checkTableStructure } from '@/lib/test-company-creation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const runTests = async () => {
    setIsLoading(true);
    
    const connectionTest = await testSupabaseConnection();
    const authFlowTest = await testAuthFlow();
    const tableStructureTest = await checkTableStructure();
    const companyCreationTest = await testCompanyCreation();
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      setDebugInfo({
        connectionTest,
        authFlowTest,
        tableStructureTest,
        companyCreationTest,
        session: session ? {
          userId: session.user.id,
          email: session.user.email,
          expiresAt: session.expires_at,
        } : null,
        sessionError: sessionError?.message,
        user: user ? {
          id: user.id,
          email: user.email,
        } : null,
        userError: userError?.message,
        environment: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Debug de Autenticação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isLoading}>
          {isLoading ? 'Testando...' : 'Executar Testes'}
        </Button>
        
        <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}