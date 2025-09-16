'use client';

import Link from 'next/link';
import { useState } from 'react';
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
import { Building, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCompany } from '@/lib/company-data';

export default function NewCompanyPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [taxRegime, setTaxRegime] = useState('');
  const [status, setStatus] = useState('');
  const [address, setAddress] = useState('');


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
        address: address || null
      };

      // Criar empresa no banco de dados
      await createCompany(companyData);

      toast({
        title: "Empresa criada com sucesso!",
        description: "A nova empresa foi salva no sistema.",
      });

      // Redirecionar para a lista de empresas
      router.push('/companies');

    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast({
        title: "Erro ao criar empresa",
        description: "Ocorreu um erro ao salvar a empresa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                <div className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/companies">Cancelar</Link>
                    </Button>
                    <Button type="submit" disabled={isFetchingCnpj || isSubmitting}>
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
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
