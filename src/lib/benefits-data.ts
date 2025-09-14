import { LucideIcon, Stethoscope, Smile, Utensils, TramFront, ShieldCheck, Banknote, Baby } from "lucide-react";

export type Benefit = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  hasValue: boolean;
};

export const benefits: Benefit[] = [
  {
    id: 'plano_saude',
    name: 'Plano de Saúde',
    description: 'Cobertura médica e hospitalar completa para você e sua família.',
    icon: Stethoscope,
    hasValue: false,
  },
  {
    id: 'plano_odontologico',
    name: 'Plano Odontológico',
    description: 'Acesso a uma ampla rede de dentistas para cuidados bucais.',
    icon: Smile,
    hasValue: false,
  },
  {
    id: 'vale_refeicao',
    name: 'Vale-Refeição',
    description: 'Crédito mensal para suas refeições diárias.',
    icon: Utensils,
    hasValue: true,
  },
  {
    id: 'vale_transporte',
    name: 'Vale-Transporte',
    description: 'Auxílio para o deslocamento entre sua casa e o trabalho.',
    icon: TramFront,
    hasValue: false,
  },
  {
    id: 'seguro_vida',
    name: 'Seguro de Vida',
    description: 'Proteção financeira para seus beneficiários em caso de imprevistos.',
    icon: ShieldCheck,
    hasValue: false,
  },
  {
    id: 'previdencia_privada',
    name: 'Previdência Privada',
    description: 'Um plano para complementar sua aposentadoria e garantir seu futuro.',
    icon: Banknote,
    hasValue: false,
  },
    {
    id: 'auxilio_creche',
    name: 'Auxílio Creche',
    description: 'Apoio financeiro para despesas com a creche de seus filhos.',
    icon: Baby,
    hasValue: true,
  },
];
