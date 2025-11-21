'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AuthLoggingDebugSimple() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Only show in development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  const addTestLog = () => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'test',
      message: 'Test log entry created',
      details: {
        test: true,
        timestamp: new Date().toLocaleTimeString()
      }
    };
    setLogs(prev => [newLog, ...prev.slice(0, 9)]); // Keep only last 10 logs
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isVisible) {
    return null;
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      case 'info': return 'default';
      case 'debug': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Auth Logging Debug Panel (Simplificado)
          <Badge variant="outline">Development Only</Badge>
        </CardTitle>
        <CardDescription>
          Monitor de logging simplificado. Este painel é visível apenas em modo de desenvolvimento.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={addTestLog} variant="outline" size="sm">
            Adicionar Log de Teste
          </Button>
          <Button onClick={clearLogs} variant="outline" size="sm">
            Limpar Logs
          </Button>
        </div>
        
        <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum log disponível. Use o botão acima para adicionar logs de teste.
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getLevelColor(log.level) as any}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {log.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="font-medium">{log.message}</p>
                  
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Ver Detalhes
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
