'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        router.push('/dashboard');
      } else if (mode === 'signup') {
        await signUp(email, password);
        toast({
          title: 'Cadastro realizado!',
          description: 'Verifique seu e-mail para confirmar o cadastro.',
        });
        setMode('login');
      } else if (mode === 'reset') {
        await resetPassword(email);
        toast({
          title: 'E-mail enviado!',
          description: 'Verifique seu e-mail para redefinir sua senha.',
        });
        setMode('login');
      }
    } catch (error: any) {
      console.error('Erro na operação:', error);
      toast({
        title: mode === 'login' ? 'Erro ao fazer login' : mode === 'signup' ? 'Erro ao cadastrar' : 'Erro ao redefinir senha',
        description: error.message || 'Verifique suas informações e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">HR Vision</h1>
          <p className="text-muted-foreground">
            {mode === 'login' && 'Entre com suas credenciais para acessar o sistema'}
            {mode === 'signup' && 'Crie sua conta para acessar o sistema'}
            {mode === 'reset' && 'Digite seu e-mail para redefinir sua senha'}
          </p>
        </div>
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
            />
          </div>
          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              mode === 'login' ? 'Entrando...' : mode === 'signup' ? 'Cadastrando...' : 'Enviando...'
            ) : (
              mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Cadastrar' : 'Enviar e-mail'
            )}
          </Button>
        </form>
        <div className="space-y-2 text-center">
          {mode === 'login' && (
            <>
              <Button variant="link" onClick={() => setMode('reset')} className="text-sm">
                Esqueceu sua senha?
              </Button>
              <div className="text-sm">
                Não tem uma conta?{' '}
                <Button variant="link" onClick={() => setMode('signup')} className="p-0">
                  Cadastre-se
                </Button>
              </div>
            </>
          )}
          {(mode === 'signup' || mode === 'reset') && (
            <Button variant="link" onClick={() => setMode('login')} className="text-sm">
              Voltar para o login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}