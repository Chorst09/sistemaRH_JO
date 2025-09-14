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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, UserPlus, ArrowLeft, HeartHandshake } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { benefits as allBenefits } from '@/lib/benefits-data';
import { Checkbox } from '@/components/ui/checkbox';
import { EmployeeBenefit } from '@/types';

export default function NewEmployeePage() {
  const [hireDate, setHireDate] = useState<Date | undefined>();
  const [selectedBenefits, setSelectedBenefits] = useState<EmployeeBenefit[]>([]);
  const { toast } = useToast();

  const handleBenefitChange = (benefitId: string, checked: boolean) => {
    const benefit = allBenefits.find(b => b.id === benefitId);
    if (!benefit) return;
  
    if (checked) {
      setSelectedBenefits(prev => [...prev, { id: benefitId, value: benefit.hasValue ? '' : undefined }]);
    } else {
      setSelectedBenefits(prev => prev.filter(b => b.id !== benefitId));
    }
  };
  
  const handleBenefitValueChange = (benefitId: string, value: string) => {
    setSelectedBenefits(prev => 
      prev.map(b => b.id === benefitId ? { ...b, value: value } : b)
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically handle form submission, e.g., send data to an API
    console.log('Selected benefits:', selectedBenefits);
    toast({
        title: "Funcionário Adicionado (Simulação)",
        description: "Em uma aplicação real, o novo funcionário seria salvo no banco de dados com os benefícios selecionados.",
    });
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/employees">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar para funcionários</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold font-headline">Adicionar Novo Funcionário</h1>
                <p className="text-muted-foreground">Preencha os detalhes do novo colaborador.</p>
            </div>
        </div>
      <Card>
        <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
                <CardHeader className="p-0 mb-6">
                    <CardTitle>Informações do Funcionário</CardTitle>
                    <CardDescription>
                        Forneça os dados pessoais e profissionais.
                    </CardDescription>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" placeholder="Ex: João da Silva" required />
                        </div>
                         <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="Ex: joao.silva@empresa.com" required/>
                        </div>
                         <div>
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" placeholder="Ex: (11) 99999-9999" />
                        </div>
                         <div>
                            <Label htmlFor="address">Endereço</Label>
                            <Input id="address" placeholder="Ex: Rua das Flores, 123, São Paulo, SP" />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <div>
                            <Label htmlFor="role">Cargo</Label>
                            <Input id="role" placeholder="Ex: Desenvolvedor Frontend" required/>
                        </div>
                         <div>
                            <Label htmlFor="department">Departamento</Label>
                             <Select required>
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Selecione o departamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Engenharia">Engenharia</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                    <SelectItem value="Vendas">Vendas</SelectItem>
                                    <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                                    <SelectItem value="Design">Design</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="salary">Salário Anual (BRL)</Label>
                            <Input id="salary" type="number" placeholder="Ex: 80000" required/>
                        </div>
                        <div>
                            <Label htmlFor="hire-date">Data de Contratação</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="hire-date"
                                    variant={'outline'}
                                    className={cn('w-full justify-start text-left font-normal', !hireDate && 'text-muted-foreground')}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {hireDate ? format(hireDate, 'dd/MM/yyyy') : <span>Selecione a data</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={hireDate} onSelect={setHireDate} initialFocus locale={ptBR}/></PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t pt-8">
                    <div className="flex items-center gap-3">
                        <HeartHandshake className="h-6 w-6" />
                        <h3 className="text-lg font-medium">Benefícios</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        {allBenefits.map(benefit => {
                            const selectedBenefit = selectedBenefits.find(b => b.id === benefit.id);
                            const isSelected = !!selectedBenefit;
                            return (
                                <div key={benefit.id} className="space-y-2">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox 
                                            id={`benefit-${benefit.id}`}
                                            checked={isSelected}
                                            onCheckedChange={(checked) => handleBenefitChange(benefit.id, !!checked)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor={`benefit-${benefit.id}`} className="font-medium cursor-pointer">
                                                {benefit.name}
                                            </Label>
                                        </div>
                                    </div>
                                    {benefit.hasValue && isSelected && (
                                        <div className="pl-6">
                                            <Input
                                                type="number"
                                                placeholder="Valor (R$)"
                                                className="h-8"
                                                value={selectedBenefit.value || ''}
                                                onChange={(e) => handleBenefitValueChange(benefit.id, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/employees">Cancelar</Link>
                    </Button>
                    <Button type="submit">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Salvar Funcionário
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
