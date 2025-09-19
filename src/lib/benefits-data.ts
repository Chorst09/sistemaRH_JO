import { LucideIcon, Stethoscope, Smile, Utensils, TramFront, ShieldCheck, Banknote, Baby } from "lucide-react";
import { supabase } from './supabase';

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
  // Dados estáticos do catálogo de benefícios como fallback
  const staticBenefits: Benefit[] = [
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

  try {
    const { data: benefitsCatalog, error } = await supabase
      .from('benefits_catalog')
      .select('*')
      .order('name')
      .returns<BenefitDB[]>();

    if (error) {
      console.warn('Erro ao buscar catálogo de benefícios do banco, usando dados estáticos:', error);
      return staticBenefits;
    }
    
    const mappedBenefits = benefitsCatalog.map(benefit => {
      // Lidar com diferentes nomes de coluna no banco
      const hasValueFromDB = benefit.hasValue ?? benefit.has_value ?? true;
      
      return {
        ...benefit,
        hasValue: hasValueFromDB,
        icon: benefitIcons[benefit.id] || Stethoscope,
      };
    });
    
    return mappedBenefits;
  } catch (error) {
    console.warn('Erro ao conectar com o banco, usando dados estáticos:', error);
    return staticBenefits;
  }
}

export async function getBenefitById(id: string): Promise<Benefit | null> {
  const { data: benefit, error } = await (supabase as any)
    .from('benefits_catalog')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar benefício:', error);
    throw new Error('Não foi possível carregar o benefício');
  }

  if (!benefit) {
    return null;
  }

  return {
    ...benefit,
    icon: benefitIcons[benefit.id] || Stethoscope,
  };
}

export async function createBenefitCatalog(benefit: Omit<BenefitDB, 'id'>): Promise<Benefit> {
  const { data, error } = await (supabase as any)
    .from('benefits_catalog')
    .insert([benefit])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar benefício:', error);
    throw new Error('Não foi possível criar o benefício');
  }

  return {
    ...data,
    icon: benefitIcons[data.id] || Stethoscope,
  };
}

export async function updateBenefitCatalog(id: string, benefit: Partial<BenefitDB>): Promise<Benefit> {
  const { data, error } = await (supabase as any)
    .from('benefits_catalog')
    .update(benefit)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar benefício:', error);
    throw new Error('Não foi possível atualizar o benefício');
  }

  return {
    ...data,
    icon: benefitIcons[data.id] || Stethoscope,
  };
}

export async function deleteBenefitCatalog(id: string): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('benefits_catalog')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar benefício:', error);
    throw new Error('Não foi possível deletar o benefício');
  }

  return true;
}
