'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, User, Database, Shield } from 'lucide-react';

export function AuthStatusDebugSimple() {
  const { user, loading } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshSessionInfo = async () => {
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      setSessionInfo({
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        userId: session?.user?.id,
        userRole: session?.user?.role || 'authenticated',
        sessionId: session?.access_token?.substring(0, 20) + '...',
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : null,
        error: error?.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error: any) {
      setSessionInfo({
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshSessionInfo();
  }, [user]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Debug: Status de Autenticação (Simplificado)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={refreshSessionInfo} 
            disabled={isRefreshing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              useAuth Hook
            </h4>
            <div className="space-y-1 text-sm">
              <div>Loading: <Badge variant={loading ? "secondary" : "outline"}>{loading ? "Sim" : "Não"}</Badge></div>
              <div>User: <Badge variant={user ? "default" : "destructive"}>{user ? "Logado" : "Não logado"}</Badge></div>
              {user && (
                <>
                  <div>Email: <code className="text-xs">{user.email}</code></div>
                  <div>ID: <code className="text-xs">{user.id}</code></div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sessão Direta
            </h4>
            {sessionInfo && (
              <div className="space-y-1 text-sm">
                <div>Sessão: <Badge variant={sessionInfo.hasSession ? "default" : "destructive"}>{sessionInfo.hasSession ? "Ativa" : "Inativa"}</Badge></div>
                <div>Usuário: <Badge variant={sessionInfo.hasUser ? "default" : "destructive"}>{sessionInfo.hasUser ? "Presente" : "Ausente"}</Badge></div>
                {sessionInfo.userEmail && (
                  <>
                    <div>Email: <code className="text-xs">{sessionInfo.userEmail}</code></div>
                    <div>ID: <code className="text-xs">{sessionInfo.userId}</code></div>
                    <div>Role: <code className="text-xs">{sessionInfo.userRole}</code></div>
                    <div>Token: <code className="text-xs">{sessionInfo.sessionId}</code></div>
                    <div>Expira: <code className="text-xs">{sessionInfo.expiresAt}</code></div>
                  </>
                )}
                {sessionInfo.error && (
                  <div>Erro: <Badge variant="destructive">{sessionInfo.error}</Badge></div>
                )}
                <div>Atualizado: <code className="text-xs">{sessionInfo.timestamp}</code></div>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Diagnóstico</h4>
          <div className="text-sm space-y-1">
            {loading && <div>⏳ Carregando informações de autenticação...</div>}
            {!loading && !user && <div>❌ Usuário não está logado</div>}
            {!loading && user && !sessionInfo?.hasSession && <div>⚠️ useAuth tem usuário mas sessão direta não encontrada</div>}
            {!loading && user && sessionInfo?.hasSession && <div>✅ Autenticação funcionando corretamente</div>}
            {sessionInfo?.error && <div>❌ Erro na sessão: {sessionInfo.error}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
