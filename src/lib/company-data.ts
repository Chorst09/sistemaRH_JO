import { Company } from '@/types/index';
import { supabase } from './supabase';

// Chave para armazenamento local
const LOCAL_STORAGE_KEY = 'hr_vision_companies';

// Dados mock para empresas quando há erro de conexão
function getMockCompanies(): Company[] {
  return [
    {
      id: '1',
      name: 'Empresa Exemplo LTDA',
      cnpj: '12.345.678/0001-99',
      taxRegime: 'Simples Nacional',
      status: 'Ativa',
      address: 'Rua das Flores, 123 - Centro - São Paulo - SP - CEP: 01234-567'
    },
    {
      id: '2',
      name: 'Tech Solutions S.A.',
      cnpj: '98.765.432/0001-10',
      taxRegime: 'Lucro Presumido',
      status: 'Ativa',
      address: 'Av. Paulista, 1000 - Bela Vista - São Paulo - SP - CEP: 01310-100'
    },
    {
      id: '3',
      name: 'Consultoria ABC LTDA',
      cnpj: '11.222.333/0001-44',
      taxRegime: 'Lucro Real',
      status: 'Inativa',
      address: 'Rua do Comércio, 456 - Centro - Rio de Janeiro - RJ - CEP: 20040-020'
    }
  ];
}

// Função para obter empresas do localStorage
function getLocalCompanies(): Company[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao ler empresas do localStorage:', error);
    return [];
  }
}

// Função para salvar empresas no localStorage
function saveLocalCompanies(companies: Company[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(companies));
  } catch (error) {
    console.error('Erro ao salvar empresas no localStorage:', error);
  }
}

export async function getCompanies(): Promise<Company[]> {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('name')
      .returns<Company[]>();

    if (error) {
      console.error('Erro ao buscar empresas:', error);
      console.log('Usando dados locais e mock para empresas');
      
      // Combinar dados mock com dados locais
      const mockCompanies = getMockCompanies();
      const localCompanies = getLocalCompanies();
      
      // Evitar duplicatas baseado no ID
      const allCompanies = [...mockCompanies];
      localCompanies.forEach(localCompany => {
        if (!allCompanies.find(company => company.id === localCompany.id)) {
          allCompanies.push(localCompany);
        }
      });
      
      return allCompanies;
    }

    return companies;
  } catch (error) {
    console.error('Erro de conexão ao buscar empresas:', error);
    console.log('Usando dados locais e mock para empresas');
    
    // Combinar dados mock com dados locais
    const mockCompanies = getMockCompanies();
    const localCompanies = getLocalCompanies();
    
    // Evitar duplicatas baseado no ID
    const allCompanies = [...mockCompanies];
    localCompanies.forEach(localCompany => {
      if (!allCompanies.find(company => company.id === localCompany.id)) {
        allCompanies.push(localCompany);
      }
    });
    
    return allCompanies;
  }
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
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([company as any])
      .select()
      .single<Company>();

    if (error) {
      console.error('Erro ao criar empresa no Supabase:', error);
      console.log('Salvando empresa localmente');
      
      // Criar empresa localmente
      const newCompany: Company = {
        ...company,
        id: Date.now().toString() // ID único baseado em timestamp
      };
      
      // Obter empresas existentes do localStorage
      const existingCompanies = getLocalCompanies();
      
      // Adicionar nova empresa
      const updatedCompanies = [...existingCompanies, newCompany];
      
      // Salvar no localStorage
      saveLocalCompanies(updatedCompanies);
      
      return newCompany;
    }

    return data;
  } catch (error) {
    console.error('Erro de conexão ao criar empresa:', error);
    console.log('Salvando empresa localmente');
    
    // Criar empresa localmente
    const newCompany: Company = {
      ...company,
      id: Date.now().toString() // ID único baseado em timestamp
    };
    
    // Obter empresas existentes do localStorage
    const existingCompanies = getLocalCompanies();
    
    // Adicionar nova empresa
    const updatedCompanies = [...existingCompanies, newCompany];
    
    // Salvar no localStorage
    saveLocalCompanies(updatedCompanies);
    
    return newCompany;
  }
}

export async function updateCompany(id: string, company: Partial<Company>): Promise<Company> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(company as any)
      .eq('id', id)
      .select()
      .single<Company>();

    if (error) {
      console.error('Erro ao atualizar empresa:', error);
      throw new Error('Não foi possível atualizar a empresa');
    }

    return data;
  } catch (error) {
    console.error('Erro de conexão ao atualizar empresa:', error);
    throw new Error('Não foi possível atualizar a empresa');
  }
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
