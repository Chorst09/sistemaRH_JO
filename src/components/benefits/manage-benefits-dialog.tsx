'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Employee } from '@/types';
import { Benefit } from '@/lib/benefits-data';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

type ManageBenefitsDialogProps = {
  children: React.ReactNode;
  employee: Employee;
  allBenefits: Benefit[];
  onBenefitsChange: (employeeId: string, newBenefitIds: string[]) => void;
};

export default function ManageBenefitsDialog({ 
    children, 
    employee, 
    allBenefits, 
    onBenefitsChange 
}: ManageBenefitsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(employee.benefits);
  const { toast } = useToast();

  const handleSave = () => {
    onBenefitsChange(employee.id, selectedBenefits);
    toast({
      title: 'Benefícios atualizados!',
      description: `Os benefícios de ${employee.name} foram salvos.`,
    });
    setOpen(false);
  };
  
  const handleCheckboxChange = (benefitId: string, checked: boolean) => {
    setSelectedBenefits(prev => 
        checked ? [...prev, benefitId] : prev.filter(id => id !== benefitId)
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if(isOpen) {
        setSelectedBenefits(employee.benefits);
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Benefícios de {employee.name}</DialogTitle>
          <DialogDescription>
            Selecione os benefícios que este funcionário deve receber.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72">
            <div className="space-y-4 py-4 pr-4">
            {allBenefits.map(benefit => (
                <div key={benefit.id} className="flex items-center space-x-3">
                    <Checkbox 
                        id={`benefit-${benefit.id}`}
                        checked={selectedBenefits.includes(benefit.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(benefit.id, !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={`benefit-${benefit.id}`} className="flex items-center gap-2 font-medium cursor-pointer">
                           <benefit.icon className="h-4 w-4 text-muted-foreground"/> {benefit.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            {benefit.description}
                        </p>
                    </div>
                </div>
            ))}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
