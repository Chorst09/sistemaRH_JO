import { supabase } from './supabase';
import { Employee, Benefit, Document, Payslip } from '@/types';
import { Database } from '@/types/supabase';

type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];
type BenefitInsert = Database['public']['Tables']['benefits']['Insert'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

export async function getEmployees() {
  try {
    const { data: employees, error } = await (supabase as any)
      .from('employees')
      .select('*')
      .order('name');

    if (error) {
      console.warn('Erro ao conectar ao banco, usando dados mock:', error.message);
      // Retornar dados mock quando não conseguir conectar ao banco
      return getMockEmployees();
    }

    // Mapear os dados do banco para o formato esperado pela interface
    const mappedEmployees = employees?.map((emp: any) => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      department: emp.department,
      admission_date: emp.hiredate || emp.created_at,
      birth_date: emp.birth_date || '1990-01-01', // Valor padrão se não existir
      phone: emp.phone || '',
      address: emp.address || '',
      city: emp.city || 'São Paulo', // Valor padrão
      state: emp.state || 'SP', // Valor padrão
      zip_code: emp.zip_code || '00000-000', // Valor padrão
      status: emp.status === 'Ativo' ? 'active' : 'inactive' as 'active' | 'inactive',
      created_at: emp.created_at,
      updated_at: emp.updated_at
    })) || [];

    return mappedEmployees;
  } catch (error) {
    console.warn('Erro ao conectar ao banco, usando dados mock:', error);
    return getMockEmployees();
  }
}

// Dados mock para desenvolvimento/teste
function getMockEmployees(): Employee[] {
  return [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      role: 'Desenvolvedor',
      department: 'TI',
      admission_date: '2023-01-15',
      birth_date: '1990-05-15',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      status: 'active',
      created_at: '2023-01-15T00:00:00Z',
      updated_at: '2023-01-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      role: 'Designer',
      department: 'Marketing',
      admission_date: '2023-02-01',
      birth_date: '1988-08-20',
      phone: '(11) 88888-8888',
      address: 'Av. Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01310-100',
      status: 'active',
      created_at: '2023-02-01T00:00:00Z',
      updated_at: '2023-02-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@empresa.com',
      role: 'Gerente',
      department: 'Vendas',
      admission_date: '2023-01-10',
      birth_date: '1985-12-03',
      phone: '(11) 77777-7777',
      address: 'Rua Augusta, 789',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01305-000',
      status: 'active',
      created_at: '2023-01-10T00:00:00Z',
      updated_at: '2023-01-10T00:00:00Z'
    }
  ];
}

export async function getEmployee(id: string) {
  const { data: employee, error } = await (supabase as any)
    .from('employees')
    .select(`
      *,
      benefits (
        *
      ),
      documents (
        *
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar funcionário: ${error.message}`);
  }

  if (!employee) {
    return null;
  }

  // Mapear os campos do banco para o formato esperado pelo frontend
  const mappedEmployee: any = {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    department: employee.department,
    status: employee.status,
    avatar: employee.avatar || '',
    managerId: employee.managerid,
    hireDate: employee.hiredate, // Mapear hiredate para hireDate
    salary: employee.salary,
    phone: employee.phone,
    address: employee.address,
    bank: employee.bank,
    bankAgency: employee.bankagency,
    bankAccount: employee.bankaccount,
    benefits: employee.benefits || [],
    documents: employee.documents || []
  };

  return mappedEmployee;
}

export async function createEmployee(employeeData: any, benefits?: any[]) {
  try {
    console.log('Dados recebidos para criação:', employeeData);
    
    // Verificar se o email já existe
    const { data: existingEmployee, error: checkError } = await (supabase as any)
      .from('employees')
      .select('id, email')
      .eq('email', employeeData.email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = não encontrado
      console.error('Erro ao verificar email:', checkError);
    }
    
    if (existingEmployee) {
      throw new Error('Este email já está sendo usado por outro funcionário. Por favor, use um email diferente.');
    }
    
    // Separar os benefícios dos dados do funcionário
    const { benefits: benefitsFromData, ...employeeWithoutBenefits } = employeeData;
    
    // Usar benefícios do parâmetro ou dos dados
    const benefitsToProcess = benefits || benefitsFromData || [];
    
    // Validar e formatar a data de contratação
    let formattedHireDate: string;
    if (employeeWithoutBenefits.hireDate) {
      const hireDate = new Date(employeeWithoutBenefits.hireDate);
      if (isNaN(hireDate.getTime())) {
        throw new Error('Data de contratação inválida');
      }
      // Formatar para YYYY-MM-DD (formato aceito pelo PostgreSQL)
      formattedHireDate = hireDate.toISOString().split('T')[0];
    } else {
      throw new Error('Data de contratação é obrigatória');
    }
    
    // Mapear os dados para o formato do banco
    const employeeForDB: any = {
      name: employeeWithoutBenefits.name,
      email: employeeWithoutBenefits.email,
      role: employeeWithoutBenefits.role,
      department: employeeWithoutBenefits.department,
      hiredate: formattedHireDate,
      salary: employeeWithoutBenefits.salary,
      phone: employeeWithoutBenefits.phone || null,
      address: employeeWithoutBenefits.address || null,
      bank: employeeWithoutBenefits.bank || null,
      bankagency: employeeWithoutBenefits.bankAgency || null,
      bankaccount: employeeWithoutBenefits.bankAccount || null,
      status: 'Ativo'
    };

    console.log('Dados formatados para o banco:', employeeForDB);

    // Inserir o funcionário
    const { data: employee, error: employeeError } = await (supabase as any)
      .from('employees')
      .insert(employeeForDB)
      .select()
      .single();

    if (employeeError) {
      console.error('Erro ao inserir funcionário:', employeeError);
      
      // Tratar erro de email duplicado
      if (employeeError.code === '23505' && employeeError.message.includes('employees_email_key')) {
        throw new Error('Este email já está sendo usado por outro funcionário. Por favor, use um email diferente.');
      }
      
      // Outros erros de constraint
      if (employeeError.code === '23505') {
        throw new Error('Já existe um funcionário com estes dados. Verifique se não há duplicação.');
      }
      
      throw new Error(`Erro ao criar funcionário: ${employeeError.message}`);
    }

    if (!employee) {
      throw new Error('Funcionário não foi criado');
    }

    console.log('Funcionário criado com sucesso:', employee);

    // Inserir os benefícios se existirem
    if (benefitsToProcess && benefitsToProcess.length > 0) {
      const benefitsForDB: BenefitInsert[] = benefitsToProcess.map((benefit: any) => ({
        employee_id: employee.id,
        benefit_type: benefit.type || benefit.id,
        value: benefit.value ? parseFloat(benefit.value) : null
      }));

      console.log('Inserindo benefícios:', benefitsForDB);

      const { error: benefitsError } = await (supabase as any)
        .from('benefits')
        .insert(benefitsForDB);

      if (benefitsError) {
        console.error('Erro ao inserir benefícios:', benefitsError);
        // Não falhar se os benefícios não foram inseridos, mas avisar
        console.warn('Funcionário criado, mas benefícios não foram salvos');
      }
    }

    return employee;
  } catch (error) {
    console.error('Erro detalhado ao criar funcionário:', error);
    throw error;
  }
}

export async function updateEmployee(id: string, employee: Partial<Employee>) {
  const { data, error } = await (supabase as any)
    .from('employees')
    .update(employee)
    .eq('id', id)
    .returns()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar funcionário: ${error.message}`);
  }

  return data;
}

export async function deleteEmployee(id: string) {
  const { error } = await (supabase as any)
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar funcionário: ${error.message}`);
  }

  return true;
}

export async function getBenefits(employeeId: string) {
  const { data: benefits, error } = await (supabase as any)
    .from('benefits')
    .select('*')
    .returns()
    .eq('employee_id', employeeId);

  if (error) {
    throw new Error(`Erro ao buscar benefícios: ${error.message}`);
  }

  return benefits;
}

export async function createBenefit(benefit: Omit<Benefit, 'id'>) {
  const { data, error } = await (supabase as any)
    .from('benefits')
    .insert([benefit])
    .returns()
    .single();

  if (error) {
    throw new Error(`Erro ao criar benefício: ${error.message}`);
  }

  return data;
}

export async function updateBenefit(id: string, benefit: Partial<Benefit>) {
  const { data, error } = await (supabase as any)
    .from('benefits')
    .update(benefit)
    .eq('id', id)
    .returns()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar benefício: ${error.message}`);
  }

  return data;
}

export async function deleteBenefit(id: string) {
  const { error } = await (supabase as any)
    .from('benefits')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar benefício: ${error.message}`);
  }

  return true;
}

export async function getDocuments(employeeId: string) {
  const { data: documents, error } = await (supabase as any)
    .from('documents')
    .select('*')
    .returns()
    .eq('employee_id', employeeId);

  if (error) {
    throw new Error(`Erro ao buscar documentos: ${error.message}`);
  }

  return documents;
}

export async function createDocument(document: Omit<Document, 'id'>) {
  const { data, error } = await (supabase as any)
    .from('documents')
    .insert([document])
    .returns()
    .single();

  if (error) {
    throw new Error(`Erro ao criar documento: ${error.message}`);
  }

  return data;
}

export async function updateDocument(id: string, document: Partial<Document>) {
  const { data, error } = await (supabase as any)
    .from('documents')
    .update(document)
    .eq('id', id)
    .returns()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar documento: ${error.message}`);
  }

  return data;
}

export async function deleteDocument(id: string) {
  const { error } = await (supabase as any)
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar documento: ${error.message}`);
  }

  return true;
}

export async function getPayslips(employeeId: string) {
  const { data: payslips, error } = await (supabase as any)
    .from('payslips')
    .select('*')
    .returns()
    .eq('employee_id', employeeId)
    .order('payment_date', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar holerites: ${error.message}`);
  }

  return payslips;
}

export async function getPayslip(id: string) {
  const { data: payslip, error } = await (supabase as any)
    .from('payslips')
    .select('*')
    .returns()
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar holerite: ${error.message}`);
  }

  return payslip;
}

export async function createPayslip(payslip: Omit<Payslip, 'id'>) {
  const { data, error } = await (supabase as any)
    .from('payslips')
    .insert([payslip])
    .returns()
    .single();

  if (error) {
    throw new Error(`Erro ao criar holerite: ${error.message}`);
  }

  return data;
}

export async function updatePayslip(id: string, payslip: Partial<Payslip>) {
  const { data, error } = await (supabase as any)
    .from('payslips')
    .update(payslip)
    .eq('id', id)
    .returns()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar holerite: ${error.message}`);
  }

  return data;
}

export async function deletePayslip(id: string) {
  const { error } = await (supabase as any)
    .from('payslips')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar holerite: ${error.message}`);
  }

  return true;
}
