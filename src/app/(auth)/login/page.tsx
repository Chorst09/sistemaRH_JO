'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { handleAuthError, validateAuthInput } from '@/lib/auth-error-handler';
import { logAuthAttempt, logSessionCreated, logSessionValidation } from '@/lib/auth-session-logger';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('sofia.ribeiro@hrvision.com');
  const [password, setPassword] = useState('Senha@123');
  const supabase = createClient();

  // Verifica se já existe uma sessão ativa
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          // Log successful session validation
          await logSessionValidation(true, session.user?.id, session.access_token.substring(0, 8));
          router.push('/companies');
        } else if (error) {
          // Log session validation failure
          await logSessionValidation(false, undefined, undefined, error, {
            userAgent: navigator.userAgent,
            location: window.location.href
          });
          
          // Log session check errors but don't show to user unless critical
          const structuredError = handleAuthError(error, {
            context: 'session_check',
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          });
          
          // Only show error to user if it's a configuration issue
          if (structuredError.type === 'config') {
            toast({
              title: "Erro de configuração",
              description: structuredError.userMessage,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        const structuredError = handleAuthError(error, {
          context: 'session_check_exception',
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        });
        
        // Only show critical errors to user
        if (structuredError.type === 'config') {
          toast({
            title: "Erro de configuração",
            description: structuredError.userMessage,
            variant: "destructive",
          });
        }
      }
    };
    checkSession();
  }, [router, supabase, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input before attempting authentication
      const validationError = validateAuthInput(email, password);
      if (validationError) {
        toast({
          title: "Dados inválidos",
          description: validationError.userMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log authentication attempt failure
        await logAuthAttempt(email, false, error, {
          userAgent: navigator.userAgent,
          location: window.location.href
        });
        
        // Use enhanced error handling
        const structuredError = handleAuthError(error, {
          email: email, // Don't log password for security
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          userAgent: navigator.userAgent,
        });
        
        toast({
          title: "Erro ao fazer login",
          description: structuredError.userMessage,
          variant: "destructive",
        });
        
        setIsLoading(false);
        return;
      }

      if (data.user && data.session) {
        // Log successful authentication attempt
        await logAuthAttempt(email, true, undefined, {
          userAgent: navigator.userAgent,
          location: window.location.href
        });
        
        // Log session creation
        await logSessionCreated(data.user, data.session, {
          userAgent: navigator.userAgent,
          location: window.location.href
        });
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        
        // Aguarda um pouco para garantir que a sessão foi salva
        setTimeout(() => {
          router.push('/companies');
        }, 100);
      }
    } catch (error: any) {
      // Handle unexpected errors
      const structuredError = handleAuthError(error, {
        email: email,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        userAgent: navigator.userAgent,
        context: 'login_form_submission',
      });
      
      toast({
        title: "Erro inesperado",
        description: structuredError.userMessage,
        variant: "destructive",
      });
      
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">HR Vision</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}