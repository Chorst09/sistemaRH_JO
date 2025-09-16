'use client';

import Link from 'next/link';
import { useState } from 'react';
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

export default function NewCompanyPage() {
  const { toast } = useToast();
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);

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


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
        title: "Empresa Adicionada (Simulação)",
        description: "Em uma aplicação real, a nova empresa seria salva no banco de dados.",
    });
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
                    <Button type="submit" disabled={isFetchingCnpj}>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Empresa
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
