import { Company } from '@/types';
import { supabase } from './supabase';

export async function getCompanies(): Promise<Company[]> {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('name')
    .returns<Company[]>();

  if (error) {
    console.error('Erro ao buscar empresas:', error);
    throw new Error('Não foi possível carregar as empresas');
  }

  return companies;
}

export async function getCompany(id: string): Promise<Company | null> {
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single<Company>();

  if (error) {
    console.error('Erro ao buscar empresa:', error);
    throw new Error('Não foi possível carregar a empresa');
  }

  if (!company) {
    return null;
  }

  return company;
}

export async function createCompany(company: Omit<Company, 'id'>): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .insert([company])
    .select()
    .single<Company>();

  if (error) {
    console.error('Erro ao criar empresa:', error);
    throw new Error('Não foi possível criar a empresa');
  }

  return data;
}

export async function updateCompany(id: string, company: Partial<Company>): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .update(company)
    .eq('id', id)
    .select()
    .single<Company>();

  if (error) {
    console.error('Erro ao atualizar empresa:', error);
    throw new Error('Não foi possível atualizar a empresa');
  }

  return data;
}

export async function deleteCompany(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar empresa:', error);
    throw new Error('Não foi possível deletar a empresa');
  }

  return true;
}
