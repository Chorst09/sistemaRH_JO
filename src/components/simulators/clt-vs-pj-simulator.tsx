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

export default function CltVsPjSimulator() {
  const [salarioClt, setSalarioClt] = useState('');
  const [faturamentoPj, setFaturamentoPj] = useState('');
  const [custosPj, setCustosPj] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<{clt: any, pj: any} | null>(null);

  const handleSimulate = () => {
    setIsSimulating(true);
    setResult(null);

    // Simulate complex calculations
    setTimeout(() => {
        const clt = Number(salarioClt) || 0;
        const pjFaturamento = Number(faturamentoPj) || 0;
        const pjCustos = Number(custosPj) || 0;

        // Simplified CLT Calculation
        const inssClt = clt * 0.11; // Simplified
        const irrfClt = (clt - inssClt) * 0.15; // Simplified
        const fgts = clt * 0.08;
        const decimoTerceiro = clt / 12;
        const ferias = (clt / 12) * 1.333;
        const liquidoClt = clt - inssClt - irrfClt;
        const custoTotalClt = clt + fgts + decimoTerceiro + ferias;

        // Simplified PJ Calculation
        const proLabore = pjFaturamento * 0.28; // Fator R para Simples Nacional
        const inssPj = proLabore * 0.11;
        const irrfPjBase = proLabore - inssPj;
        const irrfPj = irrfPjBase > 4664.68 ? (irrfPjBase * 0.275) - 869.36 : (irrfPjBase > 2826.65 ? (irrfPjBase * 0.15) - 354.80 : 0); // Simplified IRRF table
        const das = pjFaturamento * 0.06; // Simples Nacional Annex III simplified
        const impostosTotal = das + inssPj + (irrfPj > 0 ? irrfPj : 0);
        const liquidoPj = pjFaturamento - impostosTotal - pjCustos;

        setResult({
            clt: {
                salarioBruto: clt,
                liquidoMensal: liquidoClt,
                beneficiosTotal: decimoTerceiro + ferias,
                custoEmpregador: custoTotalClt,
                descontos: inssClt + irrfClt
            },
            pj: {
                faturamentoBruto: pjFaturamento,
                liquidoMensal: liquidoPj,
                impostosTotal: impostosTotal,
                impostos: {
                    das: das,
                    inss: inssPj,
                    irrf: irrfPj > 0 ? irrfPj : 0,
                },
                custosMensais: pjCustos,
            }
        });

      setIsSimulating(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulador CLT vs. PJ</CardTitle>
        <CardDescription>
          Compare os custos e o salário líquido entre os regimes de contratação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
                <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-semibold">Regime CLT</h4>
                    <div>
                        <Label htmlFor="salario-clt">Salário Bruto Mensal</Label>
                        <Input id="salario-clt" type="number" placeholder="Ex: 5000" value={salarioClt} onChange={e => setSalarioClt(e.target.value)} />
                    </div>
                </div>
                 <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-semibold">Regime PJ</h4>
                    <div>
                        <Label htmlFor="faturamento-pj">Faturamento Bruto Mensal</Label>
                        <Input id="faturamento-pj" type="number" placeholder="Ex: 8000" value={faturamentoPj} onChange={e => setFaturamentoPj(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="custos-pj">Outros Custos Mensais (PJ)</Label>
                        <Input id="custos-pj" type="number" placeholder="Ex: 500 (Contador, etc)" value={custosPj} onChange={e => setCustosPj(e.target.value)} />
                    </div>
                </div>
                 <Button onClick={handleSimulate} disabled={isSimulating || (!salarioClt && !faturamentoPj)}>
                    {isSimulating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Simulando...</> : <><Calculator className="mr-2 h-4 w-4" /> Comparar</>}
                </Button>
            </div>
            <div className="md:col-span-2">
                {!result && !isSimulating && (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                        <p>Preencha os campos para comparar os regimes.</p>
                    </div>
                )}
                {isSimulating && (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <p>Calculando e comparando...</p>
                    </div>
                )}
                {result && (
                     <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resultado da Simulação</CardTitle>
                                <CardDescription>Os valores abaixo são estimativas simplificadas.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-3 p-4 rounded-md bg-muted/30">
                                    <h4 className="font-bold text-lg text-primary">CLT</h4>
                                    <div className="flex justify-between"><span>Salário Bruto:</span> <span className="font-medium">{formatCurrency(result.clt.salarioBruto)}</span></div>
                                    <div className="flex justify-between text-red-600"><span>(-) Descontos (INSS/IRRF):</span> <span>{formatCurrency(result.clt.descontos)}</span></div>
                                    <Separator />
                                    <div className="flex justify-between font-semibold"><span>= Salário Líquido Mensal:</span> <span>{formatCurrency(result.clt.liquidoMensal)}</span></div>
                                    <Separator />
                                    <div className="flex justify-between text-green-600"><span>(+) Média Mensal de Benefícios (13º/Férias):</span> <span>{formatCurrency(result.clt.beneficiosTotal)}</span></div>
                                    <div className="flex justify-between font-bold text-lg mt-2"><span>= Líquido Mensal + Benefícios:</span> <span>{formatCurrency(result.clt.liquidoMensal + result.clt.beneficiosTotal)}</span></div>
                                    <Separator />
                                    <div className="flex justify-between text-xs text-muted-foreground pt-2"><span>Custo Total para Empresa:</span> <span>{formatCurrency(result.clt.custoEmpregador)}</span></div>
                                </div>
                                 <div className="space-y-3 p-4 rounded-md bg-muted/30">
                                    <h4 className="font-bold text-lg text-accent">PJ</h4>
                                    <div className="flex justify-between"><span>Faturamento Bruto:</span> <span className="font-medium">{formatCurrency(result.pj.faturamentoBruto)}</span></div>
                                    <div className="flex justify-between text-red-600">
                                      <span>(-) Impostos (Total):</span>
                                      <span>{formatCurrency(result.pj.impostosTotal)}</span>
                                    </div>
                                    {result.pj.impostos && (
                                    <div className="pl-4 text-xs text-red-600 space-y-1">
                                      <div className="flex justify-between"><span>- Simples Nacional (DAS):</span> <span>{formatCurrency(result.pj.impostos.das)}</span></div>
                                      <div className="flex justify-between"><span>- INSS (Pró-labore):</span> <span>{formatCurrency(result.pj.impostos.inss)}</span></div>
                                      <div className="flex justify-between"><span>- IRRF (Pró-labore):</span> <span>{formatCurrency(result.pj.impostos.irrf)}</span></div>
                                    </div>
                                    )}
                                    <div className="flex justify-between text-red-600"><span>(-) Custos Adicionais:</span> <span>{formatCurrency(result.pj.custosMensais)}</span></div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg"><span>= Líquido Mensal:</span> <span>{formatCurrency(result.pj.liquidoMensal)}</span></div>
                                    <Separator />
                                     <div className="text-xs text-muted-foreground pt-2">
                                        <p>Lembre-se que como PJ, você é responsável por reservar valores para 13º e férias, e que os impostos podem variar.</p>
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
