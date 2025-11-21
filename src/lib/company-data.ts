import { Company } from '@/types/index';

// Dados mock para empresas (fallback)
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

// Exportações disponíveis: getCompanies, getCompany, createCompany, updateCompany, deleteCompany
export async function getCompanies(): Promise<Company[]> {
  try {
    const response = await fetch('/api/companies');
    if (!response.ok) {
      throw new Error('Erro ao buscar empresas');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return getMockCompanies();
  }
}

export async function getCompany(id: string): Promise<Company | null> {
  try {
    const companies = await getCompanies();
    return companies.find(c => c.id === id) || null;
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return null;
  }
}

export async function createCompany(company: Omit<Company, 'id'>): Promise<Company> {
  try {
    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar empresa');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    throw error;
  }
}

export async function updateCompany(id: string, company: Partial<Company>): Promise<Company> {
  try {
    const response = await fetch(`/api/companies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar empresa');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    throw error;
  }
}

export async function deleteCompany(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/companies/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar empresa');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    throw error;
  }
}
