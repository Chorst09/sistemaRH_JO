import { Company } from '@/types/index';
import { createClient } from './supabase-client';
import { Database } from '@/types/supabase';

type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

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

// Função para converter dados do DB para o formato da aplicação
function dbToCompany(dbCompany: any): Company {
  return {
    id: dbCompany.id,
    name: dbCompany.name,
    cnpj: dbCompany.cnpj,
    taxRegime: dbCompany.taxregime || dbCompany.tax_regime, // Suporta ambos os nomes
    status: dbCompany.status,
    address: dbCompany.address
  };
}

// Exportações disponíveis: getCompanies, getCompany, createCompany, updateCompany, deleteCompany
export async function getCompanies(): Promise<Company[]> {
  try {
    console.log('=== BUSCANDO EMPRESAS ===');
    
    const supabase = createClient();
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) {
      console.error('=== ERRO AO BUSCAR EMPRESAS NO SUPABASE ===');
      console.error('Erro:', error);
      console.log('=== USANDO DADOS LOCAIS E MOCK ===');
      
      // Combinar dados mock com dados locais
      const mockCompanies = getMockCompanies();
      const localCompanies = getLocalCompanies();
      
      console.log('Empresas mock:', mockCompanies.length);
      console.log('Empresas locais:', localCompanies.length);
      
      // Evitar duplicatas baseado no ID
      const allCompanies = [...mockCompanies];
      localCompanies.forEach(localCompany => {
        if (!allCompanies.find(company => company.id === localCompany.id)) {
          allCompanies.push(localCompany);
        }
      });
      
      console.log('Total de empresas combinadas:', allCompanies.length);
      console.log('Empresas finais:', allCompanies);
      
      return allCompanies;
    }

    console.log('=== EMPRESAS DO SUPABASE ===');
    console.log('Empresas encontradas:', companies.length);
    
    // Converter dados do DB para o formato da aplicação
    const formattedCompanies = companies.map(dbToCompany);
    console.log('Empresas formatadas:', formattedCompanies);
    
    return formattedCompanies;
  } catch (error) {
    console.error('=== ERRO DE CONEXÃO AO BUSCAR EMPRESAS ===');
    console.error('Erro:', error);
    console.log('=== USANDO DADOS LOCAIS E MOCK (FALLBACK) ===');
    
    // Combinar dados mock com dados locais
    const mockCompanies = getMockCompanies();
    const localCompanies = getLocalCompanies();
    
    console.log('Empresas mock (fallback):', mockCompanies.length);
    console.log('Empresas locais (fallback):', localCompanies.length);
    
    // Evitar duplicatas baseado no ID
    const allCompanies = [...mockCompanies];
    localCompanies.forEach(localCompany => {
      if (!allCompanies.find(company => company.id === localCompany.id)) {
        allCompanies.push(localCompany);
      }
    });
    
    console.log('Total de empresas combinadas (fallback):', allCompanies.length);
    console.log('Empresas finais (fallback):', allCompanies);
    
    return allCompanies;
  }
}

export async function getCompany(id: string): Promise<Company | null> {
  const supabase = createClient();
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar empresa:', error);
    throw new Error('Não foi possível carregar a empresa');
  }

  if (!company) {
    return null;
  }

  return dbToCompany(company);
}

export async function createCompany(company: Omit<Company, 'id'>): Promise<Company> {
  try {
    console.log('=== INICIANDO CRIAÇÃO DE EMPRESA ===');
    console.log('Dados recebidos:', company);
    
    // Usar o mesmo cliente que o useAuth
    const supabase = createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Erro ao verificar autenticação:', authError);
      throw new Error('Erro ao verificar autenticação. Faça login novamente.');
    }
    
    console.log('Status da sessão:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      sessionId: session?.access_token?.substring(0, 20) + '...'
    });
    
    if (!session || !session.user) {
      console.error('Usuário não autenticado');
      console.error('Detalhes da sessão:', session);
      throw new Error('Você precisa estar logado para criar uma empresa. Faça login e tente novamente.');
    }
    
    console.log('Usuário autenticado:', session.user.email);
    console.log('ID do usuário:', session.user.id);
    console.log('Role do usuário:', session.user.role || 'authenticated');
    
    // Validar e limpar dados obrigatórios
    const name = company.name?.trim();
    const cnpj = company.cnpj?.trim();
    const taxRegime = company.taxRegime?.trim();
    const status = company.status?.trim();
    const address = company.address?.trim() || null;
    
    if (!name || !cnpj || !taxRegime || !status) {
      console.error('Campos obrigatórios faltando:', { name, cnpj, taxRegime, status });
      throw new Error('Campos obrigatórios não preenchidos');
    }

    // Validar regime tributário
    const validTaxRegimes = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'];
    if (!validTaxRegimes.includes(taxRegime)) {
      console.error('Regime tributário inválido:', taxRegime);
      throw new Error(`Regime tributário inválido. Deve ser um dos: ${validTaxRegimes.join(', ')}`);
    }

    // Validar status
    const validStatuses = ['Ativa', 'Inativa'];
    if (!validStatuses.includes(status)) {
      console.error('Status inválido:', status);
      throw new Error(`Status inválido. Deve ser um dos: ${validStatuses.join(', ')}`);
    }

    // Verificar se já existe uma empresa com este CNPJ
    console.log('Verificando se CNPJ já existe...');
    const { data: existingCompany, error: checkError } = await supabase
      .from('companies')
      .select('id, name, cnpj')
      .eq('cnpj', cnpj)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found (esperado)
      console.error('Erro ao verificar CNPJ existente:', checkError);
      // Continuar mesmo com erro de verificação
    }

    if (existingCompany) {
      console.error('CNPJ já existe:', existingCompany);
      throw new Error(`Já existe uma empresa cadastrada com este CNPJ: ${existingCompany.name}`);
    }

    console.log('CNPJ disponível para uso');
    
    // Mapear os dados para o formato do banco com validação extra
    // IMPORTANTE: Enviando para AMBAS as colunas para garantir compatibilidade
    const companyForDB: any = {
      name: name,
      cnpj: cnpj,
      tax_regime: taxRegime, // Coluna com underscore (parece ser a principal)
      taxregime: taxRegime,  // Coluna sem underscore (backup)
      status: status,
      address: address,
    };
    
    console.log('Dados mapeados para o banco:', companyForDB);
    console.log('Validação tax_regime:', {
      original: company.taxRegime,
      cleaned: taxRegime,
      tax_regime: companyForDB.tax_regime,
      taxregime: companyForDB.taxregime,
      isNull: companyForDB.tax_regime === null,
      isUndefined: companyForDB.tax_regime === undefined
    });
    
    console.log('Enviando para Supabase...');
    
    const { data, error } = await supabase
      .from('companies')
      .insert([companyForDB])
      .select()
      .single();

    if (error) {
      console.error('=== ERRO NO SUPABASE ===');
      console.error('Erro completo:', error);
      console.error('Mensagem:', error.message);
      console.error('Código:', error.code);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
      console.error('Dados enviados:', companyForDB);
      
      // Verificar se é erro de RLS (Row Level Security)
      if (error.message.includes('row-level security policy')) {
        throw new Error('Você não tem permissão para criar empresas. Entre em contato com o administrador do sistema.');
      }
      
      // Verificar se é erro de constraint NOT NULL
      if (error.message.includes('null value in column')) {
        const match = error.message.match(/null value in column "(\w+)"/);
        const columnName = match ? match[1] : 'desconhecida';
        throw new Error(`O campo '${columnName}' é obrigatório e não pode estar vazio.`);
      }
      
      // Verificar se é erro de autenticação
      if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error('Você não tem permissão para criar empresas. Verifique se está logado corretamente.');
      }

      // Verificar se é erro de CNPJ duplicado
      if (error.message.includes('duplicate key value') && error.message.includes('cnpj')) {
        throw new Error('Já existe uma empresa cadastrada com este CNPJ. Verifique o número e tente novamente.');
      }

      // Verificar se é erro de constraint única
      if (error.code === '23505') {
        if (error.message.includes('cnpj')) {
          throw new Error('Este CNPJ já está cadastrado no sistema.');
        }
        throw new Error('Dados duplicados. Verifique as informações e tente novamente.');
      }
      
      throw new Error(`Erro ao criar empresa: ${error.message}`);
    }

    if (!data) {
      throw new Error('Nenhum dado retornado após criar empresa');
    }

    console.log('=== EMPRESA CRIADA COM SUCESSO ===');
    console.log('Dados retornados:', data);
    
    // Converter dados do DB para o formato da aplicação
    const newCompany = dbToCompany(data);
    console.log('Dados formatados:', newCompany);
    
    return newCompany;
  } catch (error) {
    console.error('=== ERRO AO CRIAR EMPRESA ===');
    console.error('Erro:', error);
    throw error;
  }
}

export async function updateCompany(id: string, company: Partial<Company>): Promise<Company> {
  try {
    const supabase = createClient();
    
    // Mapear os dados para o formato do banco
    const companyForDB: any = {
      ...(company.name && { name: company.name }),
      ...(company.cnpj && { cnpj: company.cnpj }),
      ...(company.taxRegime && { 
        tax_regime: company.taxRegime,  // Coluna principal
        taxregime: company.taxRegime    // Coluna backup
      }),
      ...(company.status && { status: company.status }),
      ...(company.address !== undefined && { address: company.address }),
    };

    const { data, error } = await supabase
      .from('companies')
      .update(companyForDB)
      .eq('id', id)
      .select()
      .single();

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
  const supabase = createClient();
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
