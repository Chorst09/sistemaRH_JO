'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBenefitsCatalog, Benefit } from '@/lib/benefits-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmployeeBenefit } from '@/types/index';

export function BenefitsDebug() {
  const [allBenefits, setAllBenefits] = useState<Benefit[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<EmployeeBenefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const loadBenefits = async () => {
      try {
        const benefits = await getBenefitsCatalog();
        setAllBenefits(benefits);
        setDebugInfo({
          totalBenefits: benefits.length,
          benefitsWithValue: benefits.filter(b => b.hasValue).length,
          benefitsWithoutValue: benefits.filter(b => !b.hasValue).length,
          benefits: benefits.map(b => ({
            id: b.id,
            name: b.name,
            hasValue: b.hasValue
          }))
        });
      } catch (error) {
        console.error('Erro ao carregar benefícios:', error);
        setDebugInfo({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
      } finally {
        setIsLoading(false);
      }
    };

    loadBenefits();
  }, []);

  const handleBenefitChange = (benefitId: string, checked: boolean) => {
    const benefit = allBenefits.find(b => b.id === benefitId);
    if (!benefit) return;

    console.log('Benefit change:', { benefitId, checked, benefit: benefit.name, hasValue: benefit.hasValue });

    if (checked) {
      const newBenefit = { id: benefitId, value: benefit.hasValue ? '' : undefined };
      setSelectedBenefits(prev => [...prev, newBenefit]);
      console.log('Added benefit:', newBenefit);
    } else {
      setSelectedBenefits(prev => prev.filter(b => b.id !== benefitId));
      console.log('Removed benefit:', benefitId);
    }
  };

  const handleBenefitValueChange = (benefitId: string, value: string) => {
    console.log('Value change:', { benefitId, value });
    setSelectedBenefits(prev => 
      prev.map(b => b.id === benefitId ? { ...b, value: value } : b)
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <p>Carregando benefícios...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Debug de Benefícios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Debug Info */}
        <div className="bg-muted p-4 rounded">
          <h3 className="font-semibold mb-2">Informações de Debug:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Selected Benefits */}
        <div className="bg-muted p-4 rounded">
          <h3 className="font-semibold mb-2">Benefícios Selecionados:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(selectedBenefits, null, 2)}
          </pre>
        </div>

        {/* Benefits List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lista de Benefícios:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {allBenefits.map(benefit => {
              const selectedBenefit = selectedBenefits.find(b => b.id === benefit.id);
              const isSelected = !!selectedBenefit;
              
              return (
                <div key={benefit.id} className="space-y-2 p-3 border rounded">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id={`debug-benefit-${benefit.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleBenefitChange(benefit.id, !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none flex-1">
                      <Label htmlFor={`debug-benefit-${benefit.id}`} className="font-medium cursor-pointer">
                        {benefit.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        hasValue: {benefit.hasValue ? 'true' : 'false'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {benefit.id}
                      </p>
                    </div>
                  </div>
                  
                  {/* Debug: sempre mostrar o campo para testar */}
                  <div className="pl-6 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Condições: hasValue={benefit.hasValue ? 'true' : 'false'}, isSelected={isSelected ? 'true' : 'false'}
                    </div>
                    
                    {benefit.hasValue && isSelected && (
                      <div>
                        <Label className="text-xs">Campo de Valor (deve aparecer):</Label>
                        <Input
                          type="number"
                          placeholder="Valor (R$)"
                          className="h-8"
                          value={selectedBenefit?.value || ''}
                          onChange={(e) => handleBenefitValueChange(benefit.id, e.target.value)}
                        />
                      </div>
                    )}
                    
                    {(!benefit.hasValue || !isSelected) && (
                      <div className="text-xs text-red-500">
                        Campo não deve aparecer: {!benefit.hasValue ? 'hasValue=false' : 'não selecionado'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Button onClick={() => console.log('Current state:', { allBenefits, selectedBenefits })}>
          Log Estado Atual
        </Button>
      </CardContent>
    </Card>
  );
}