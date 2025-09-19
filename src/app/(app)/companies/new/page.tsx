'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building, ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCompany } from '@/lib/company-data';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Remove debug component completely for production build

export default function NewCompanyPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [taxRegime, setTaxRegime] = useState('');
  const [status, setStatus] = useState('');
  const [address, setAddress] = useState('');

  // Verificar autenticação
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para criar empresas.",
        variant: "destructive",
      });
      router.push('/login');
    }
  }, [user, loading, router, toast]);


  const handleCnpjBlur = async () => {
    const cleanedCnpj = cnpj.replace(/[^\d]/g, '');
    if (cleanedCnpj.length !== 14) {
      return;
    }

    setIsFetchingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanedCnpj}`);
      if (!response.ok) {
        throw new Error('CNPJ não encontrado ou inválido.');
      }
      const data = await response.json();
      
      setRazaoSocial(data.razao_social || '');
      
      const fullAddress = [
        data.logradouro,
        data.numero,
        data.complemento,
        data.bairro,
        data.municipio ? `${data.municipio} - ${data.uf}` : '',
        data.cep ? `CEP: ${data.cep}` : ''
      ].filter(Boolean).join(', ');

      setAddress(fullAddress);

      toast({
        title: "Dados do CNPJ carregados!",
        description: "A razão social e o endereço foram preenchidos.",
      });

    } catch (error: any) {
      toast({
        title: "Erro ao buscar CNPJ",
        description: error.message || "Não foi possível obter os dados da empresa.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingCnpj(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar campos obrigatórios
      if (!razaoSocial || !cnpj || !taxRegime || !status) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      // Criar objeto da empresa
      const companyData = {
        name: razaoSocial,
        cnpj: cnpj,
        taxRegime: taxRegime as 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real',
        status: status as 'Ativa' | 'Inativa',
        address: address || undefined
      };

      // Criar empresa no banco de dados
      console.log('=== INICIANDO CRIAÇÃO DE EMPRESA NA PÁGINA ===');
      const newCompany = await createCompany(companyData);
      console.log('=== EMPRESA CRIADA NA PÁGINA ===', newCompany);

      toast({
        title: "Empresa criada com sucesso!",
        description: "A nova empresa foi salva no sistema.",
      });

      // Aguardar um pouco antes de redirecionar para garantir que os dados foram salvos
      setTimeout(() => {
        console.log('=== REDIRECIONANDO PARA LISTA DE EMPRESAS ===');
        router.push('/companies');
      }, 500);

    } catch (error: any) {
      console.error('Erro ao criar empresa:', error);
      
      // Extrair mensagem de erro específica
      let errorMessage = "Ocorreu um erro ao salvar a empresa. Tente novamente.";
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao criar empresa",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Não mostrar nada se não estiver autenticado (será redirecionado)
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/companies">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar para empresas</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold font-headline">Adicionar Nova Empresa</h1>
                <p className="text-muted-foreground">Preencha os detalhes da nova empresa.</p>
            </div>
        </div>

        {/* Mostrar informação do usuário logado */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Logado como: <strong>{user.email}</strong>
          </AlertDescription>
        </Alert>

        {/* Debug de autenticação - Removido para produção */}
        {/* <AuthStatusDebug /> */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building /> Informações da Empresa</CardTitle>
            <CardDescription>Forneça os dados cadastrais e fiscais. O endereço é preenchido automaticamente ao inserir um CNPJ válido.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div className="relative">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input 
                      id="cnpj" 
                      placeholder="Ex: 12.345.678/0001-99" 
                      required
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      onBlur={handleCnpjBlur}
                    />
                    {isFetchingCnpj && <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin" />}
                </div>
                <div>
                    <Label htmlFor="name">Razão Social</Label>
                    <Input 
                      id="name" 
                      placeholder="Preenchido automaticamente" 
                      required 
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                    />
                </div>
                 <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input 
                      id="address" 
                      placeholder="Preenchido automaticamente" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="tax-regime">Regime Tributário</Label>
                    <Select required onValueChange={setTaxRegime} value={taxRegime}>
                        <SelectTrigger id="tax-regime">
                            <SelectValue placeholder="Selecione o regime" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                            <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                            <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select required onValueChange={setStatus} value={status}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Ativa">Ativa</SelectItem>
                            <SelectItem value="Inativa">Inativa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Empresa
                        </>
                    )}
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
