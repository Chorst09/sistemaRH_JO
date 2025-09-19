import { LucideIcon, Stethoscope, Smile, Utensils, TramFront, ShieldCheck, Banknote, Baby } from "lucide-react";

export type Benefit = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  hasValue: boolean;
};

export type BenefitDB = Omit<Benefit, 'icon'> & {
  has_value?: boolean; // Coluna do banco pode ter nome diferente
};

export const benefitIcons: Record<string, LucideIcon> = {
  plano_saude: Stethoscope,
  plano_odontologico: Smile,
  vale_refeicao: Utensils,
  vale_transporte: TramFront,
  seguro_vida: ShieldCheck,
  previdencia_privada: Banknote,
  auxilio_creche: Baby,
};

export async function getBenefitsCatalog(): Promise<Benefit[]> {
  // Always return static data during build to avoid environment issues
  return getStaticBenefits();
}

function getStaticBenefits(): Benefit[] {
  return [
    {
      id: 'plano_saude',
      name: 'Plano de Saúde',
      description: 'Cobertura médica completa para funcionários e dependentes',
      icon: benefitIcons['plano_saude'] || Stethoscope,
      hasValue: true,
    },
    {
      id: 'plano_odontologico',
      name: 'Plano Odontológico',
      description: 'Cobertura odontológica para funcionários e dependentes',
      icon: benefitIcons['plano_odontologico'] || Smile,
      hasValue: true,
    },
    {
      id: 'vale_refeicao',
      name: 'Vale Refeição',
      description: 'Auxílio alimentação para refeições durante o expediente',
      icon: benefitIcons['vale_refeicao'] || Utensils,
      hasValue: true,
    },
    {
      id: 'vale_transporte',
      name: 'Vale Transporte',
      description: 'Auxílio transporte para deslocamento casa-trabalho',
      icon: benefitIcons['vale_transporte'] || TramFront,
      hasValue: true,
    },
    {
      id: 'seguro_vida',
      name: 'Seguro de Vida',
      description: 'Seguro de vida em grupo para funcionários',
      icon: benefitIcons['seguro_vida'] || ShieldCheck,
      hasValue: true,
    },
    {
      id: 'previdencia_privada',
      name: 'Previdência Privada',
      description: 'Plano de previdência complementar',
      icon: benefitIcons['previdencia_privada'] || Banknote,
      hasValue: true,
    },
    {
      id: 'auxilio_creche',
      name: 'Auxílio Creche',
      description: 'Auxílio para despesas com creche/educação infantil',
      icon: benefitIcons['auxilio_creche'] || Baby,
      hasValue: true,
    },
  ];
}

// Supabase-dependent functions removed to avoid build issues
// These can be re-implemented when environment variables are properly configured

export async function getBenefitById(id: string): Promise<Benefit | null> {
  const staticBenefits = getStaticBenefits();
  return staticBenefits.find(benefit => benefit.id === id) || null;
}
