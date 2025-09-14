'use client';

import Link from 'next/link';
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
import { Building, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NewCompanyPage() {
  const { toast } = useToast();

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
            <CardDescription>Forneça os dados cadastrais e fiscais.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div>
                    <Label htmlFor="name">Razão Social</Label>
                    <Input id="name" placeholder="Ex: Tech Solutions Ltda." required />
                </div>
                <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" placeholder="Ex: 12.345.678/0001-99" required/>
                </div>
                <div>
                    <Label htmlFor="tax-regime">Regime Tributário</Label>
                    <Select required>
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
                <div className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/companies">Cancelar</Link>
                    </Button>
                    <Button type="submit">
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
