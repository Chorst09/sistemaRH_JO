'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
// Removed problematic auth logging dependencies for production build
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
          console.log('Session found, redirecting to companies');
          router.push('/companies');
        } else if (error) {
          console.warn('Session check error:', error.message);
        }
      } catch (error) {
        console.warn('Session check exception:', error);
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!email || !password) {
        toast({
          title: "Dados inválidos",
          description: "Por favor, preencha email e senha.",
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
        console.error('Login error:', error);
        
        let errorMessage = "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.";
        
        // Handle specific error types
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "E-mail ou senha incorretos.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Muitas tentativas de login. Tente novamente em alguns minutos.";
        }
        
        toast({
          title: "Erro ao fazer login",
          description: errorMessage,
          variant: "destructive",
        });
        
        setIsLoading(false);
        return;
      }

      if (data.user && data.session) {
        console.log('Login successful, redirecting...');
        
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
      console.error('Unexpected login error:', error);
      
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.",
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