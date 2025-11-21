'use client';

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
import { Calculator, Loader2 } from 'lucide-react';
import { Separator } from '../ui/separator';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

type DomesticCalculation = {
    employerCosts: {
        inss: number;
        fgts: number;
        gilrat: number;
        fgtsCompensatory: number;
        total: number;
    };
    employeeDeductions: {
        inss: number;
    };
    totalEmployerCost: number;
    netSalary: number;
};

export default function DomesticSimulator() {
  const [salarioBruto, setSalarioBruto] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<DomesticCalculation | null>(null);

  const calculateInssEmployee = (salary: number) => {
    if (salary <= 1518.00) return salary * 0.075;
    if (salary <= 2793.88) return salary * 0.09;
    if (salary <= 4190.83) return salary * 0.12;
    if (salary <= 8157.41) return salary * 0.14;
    return 8157.41 * 0.14; // Teto
  }

  const handleSimulate = () => {
    setIsSimulating(true);
    setResult(null);

    setTimeout(() => {
        const salary = Number(salarioBruto) || 0;

        // Employer costs
        const inssEmployer = salary * 0.08;
        const fgts = salary * 0.08;
        const gilrat = salary * 0.008;
        const fgtsCompensatory = salary * 0.032;
        const totalEmployerCharges = inssEmployer + fgts + gilrat + fgtsCompensatory;
        const totalEmployerCost = salary + totalEmployerCharges;

        // Employee deductions
        const inssEmployee = calculateInssEmployee(salary);
        const netSalary = salary - inssEmployee;
        
        setResult({
            employerCosts: {
                inss: inssEmployer,
                fgts: fgts,
                gilrat: gilrat,
                fgtsCompensatory: fgtsCompensatory,
                total: totalEmployerCharges
            },
            employeeDeductions: {
                inss: inssEmployee,
            },
            totalEmployerCost: totalEmployerCost,
            netSalary: netSalary,
        });

      setIsSimulating(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulador de Empregado Doméstico</CardTitle>
        <CardDescription>
          Calcule os custos mensais para a contratação de um empregado doméstico via eSocial (DAE).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="salario-domestico">Salário Bruto Mensal</Label>
                        <Input id="salario-domestico" type="number" placeholder="Ex: 1412" value={salarioBruto} onChange={e => setSalarioBruto(e.target.value)} />
                    </div>
                </div>
                 <Button onClick={handleSimulate} disabled={isSimulating || !salarioBruto}>
                    {isSimulating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Simulando...</> : <><Calculator className="mr-2 h-4 w-4" /> Calcular</>}
                </Button>
            </div>
            <div className="md:col-span-2">
                {!result && !isSimulating && (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                        <p>Informe o salário bruto para calcular os custos.</p>
                    </div>
                )}
                {isSimulating && (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <p>Calculando...</p>
                    </div>
                )}
                {result && (
                     <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resultado da Simulação</CardTitle>
                                <CardDescription>Estimativa de custos mensais (DAE).</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-3 p-4 rounded-md bg-muted/30">
                                    <h4 className="font-bold text-lg text-primary">Custo Total do Empregador</h4>
                                    <div className="flex justify-between"><span>Salário Bruto:</span> <span className="font-medium">{formatCurrency(Number(salarioBruto))}</span></div>
                                    <Separator />
                                    <p className="font-semibold">Encargos do Empregador:</p>
                                    <div className="pl-4 text-xs space-y-1">
                                         <div className="flex justify-between"><span>INSS (8%):</span> <span>{formatCurrency(result.employerCosts.inss)}</span></div>
                                         <div className="flex justify-between"><span>FGTS (8%):</span> <span>{formatCurrency(result.employerCosts.fgts)}</span></div>
                                         <div className="flex justify-between"><span>Seguro Acidente (0.8%):</span> <span>{formatCurrency(result.employerCosts.gilrat)}</span></div>
                                         <div className="flex justify-between"><span>FGTS Comp. (3.2%):</span> <span>{formatCurrency(result.employerCosts.fgtsCompensatory)}</span></div>
                                    </div>
                                     <Separator />
                                    <div className="flex justify-between font-semibold"><span>Total de Encargos:</span> <span>{formatCurrency(result.employerCosts.total)}</span></div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg mt-2"><span>= Custo Mensal Total:</span> <span>{formatCurrency(result.totalEmployerCost)}</span></div>
                                </div>
                                 <div className="space-y-3 p-4 rounded-md bg-muted/30">
                                    <h4 className="font-bold text-lg text-accent">Salário do Empregado</h4>
                                    <div className="flex justify-between"><span>Salário Bruto:</span> <span className="font-medium">{formatCurrency(Number(salarioBruto))}</span></div>
                                    <Separator />
                                    <p className="font-semibold">Descontos do Empregado:</p>
                                     <div className="pl-4 text-xs space-y-1">
                                         <div className="flex justify-between text-red-600"><span>INSS Retido:</span> <span>{formatCurrency(result.employeeDeductions.inss)}</span></div>
                                     </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg mt-2"><span>= Salário Líquido a Receber:</span> <span>{formatCurrency(result.netSalary)}</span></div>
                                     <Separator />
                                     <div className="text-xs text-muted-foreground pt-2">
                                        <p>Cálculo simplificado. Não inclui IRRF ou outros descontos como faltas.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                     </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
