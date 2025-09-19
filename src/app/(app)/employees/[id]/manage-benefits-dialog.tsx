'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getBenefitsCatalog, Benefit } from '@/lib/benefits-data';

interface ManageBenefitsDialogProps {
  selectedBenefits: string[];
  onBenefitsChange: (benefits: string[]) => void;
}

export function ManageBenefitsDialog({
  selectedBenefits,
  onBenefitsChange,
}: ManageBenefitsDialogProps) {
  const [open, setOpen] = useState(false);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [selected, setSelected] = useState<string[]>(selectedBenefits);

  useEffect(() => {
    async function loadBenefits() {
      const data = await getBenefitsCatalog();
      setBenefits(data);
    }

    loadBenefits();
  }, []);

  const handleSubmit = () => {
    onBenefitsChange(selected);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Gerenciar Benefícios</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Benefícios</DialogTitle>
          <DialogDescription>
            Selecione os benefícios que deseja atribuir ao funcionário.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="flex items-center space-x-2">
              <Checkbox
                id={benefit.id}
                checked={selected.includes(benefit.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelected([...selected, benefit.id]);
                  } else {
                    setSelected(selected.filter((id) => id !== benefit.id));
                  }
                }}
              />
              <Label htmlFor={benefit.id} className="flex-1">
                {benefit.name}
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}