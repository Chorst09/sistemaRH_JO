'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import authLogger from '@/lib/auth-logger';
import { getSessionLoggingStats } from '@/lib/auth-session-logger';
import type { AuthLogEntry } from '@/lib/auth-logger';

export function AuthLoggingDebug() {
  const [logs, setLogs] = useState<AuthLogEntry[]>([]);
  const [config, setConfig] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  const refreshLogs = () => {
    const stats = getSessionLoggingStats();
    setLogs(stats.recentLogs);
    setConfig(stats.loggerConfig);
  };

  useEffect(() => {
    refreshLogs();
    
    // Refresh logs every 5 seconds
    const interval = setInterval(refreshLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const clearLogs = () => {
    authLogger.clearBuffer();
    refreshLogs();
  };

  const testLogging = async () => {
    await authLogger.logDebug('Test debug message', { test: true }, 'debug_test');
    await authLogger.logAuthError('Test auth error', new Error('Test error'), 'test_context');
    await authLogger.logConfigError('Test config error', { testConfig: 'invalid' }, 'test_config');
    refreshLogs();
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth': return 'bg-red-100 text-red-800';
      case 'config': return 'bg-blue-100 text-blue-800';
      case 'network': return 'bg-green-100 text-green-800';
      case 'validation': return 'bg-yellow-100 text-yellow-800';
      case 'session': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Auth Logging Debug Panel
          <Badge variant="outline">Development Only</Badge>
        </CardTitle>
        <CardDescription>
          Monitor authentication logging in real-time. This panel is only visible in development mode.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logs">Recent Logs ({logs.length})</TabsTrigger>
            <TabsTrigger value="config">Logger Config</TabsTrigger>
            <TabsTrigger value="actions">Test Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logs" className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={refreshLogs} variant="outline" size="sm">
                Refresh Logs
              </Button>
              <Button onClick={clearLogs} variant="outline" size="sm">
                Clear Buffer
              </Button>
            </div>
            
            <ScrollArea className="h-96 w-full border rounded-md p-4">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No logs available. Try performing some authentication actions.
                </p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getLevelColor(log.level) as any}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <Badge className={getCategoryColor(log.category)}>
                          {log.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        {log.sensitive && (
                          <Badge variant="destructive" className="text-xs">
                            SENSITIVE
                          </Badge>
                        )}
                      </div>
                      
                      <p className="font-medium">{log.message}</p>
                      
                      {log.details.errorCode && (
                        <p className="text-sm text-muted-foreground">
                          Error Code: {log.details.errorCode}
                        </p>
                      )}
                      
                      {log.details.statusCode && (
                        <p className="text-sm text-muted-foreground">
                          Status: {log.details.statusCode}
                        </p>
                      )}
                      
                      {log.details.context && (
                        <p className="text-sm text-muted-foreground">
                          Context: {log.details.context}
                        </p>
                      )}
                      
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Environment</h4>
                <Badge variant="outline">{config.environment}</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Log Level</h4>
                <Badge variant="outline">{config.logLevel}</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Console Logging</h4>
                <Badge variant={config.enableConsoleLogging ? "default" : "secondary"}>
                  {config.enableConsoleLogging ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Remote Logging</h4>
                <Badge variant={config.enableRemoteLogging ? "default" : "secondary"}>
                  {config.enableRemoteLogging ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mask Sensitive Data</h4>
                <Badge variant={config.maskSensitiveData ? "default" : "destructive"}>
                  {config.maskSensitiveData ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Full Configuration</h4>
              <pre className="p-3 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={testLogging} variant="outline">
                Test All Log Types
              </Button>
              <Button 
                onClick={() => authLogger.logDebug('Manual debug test', { manual: true })}
                variant="outline"
              >
                Test Debug Log
              </Button>
              <Button 
                onClick={() => authLogger.logAuthError('Manual auth error test', new Error('Test'), 'manual_test')}
                variant="outline"
              >
                Test Auth Error
              </Button>
              <Button 
                onClick={() => authLogger.logConfigError('Manual config error test', { test: 'config' })}
                variant="outline"
              >
                Test Config Error
              </Button>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Instructions</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use the test buttons above to generate sample log entries</li>
                <li>• Try logging in/out to see authentication logs</li>
                <li>• Check the browser console for detailed log output</li>
                <li>• Logs are automatically refreshed every 5 seconds</li>
                <li>• This panel is only visible in development mode</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}