import { supabase } from './supabase';
import { Employee, Benefit, Document, Payslip } from '@/types';
import { Database } from '@/types/supabase';

type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];
type BenefitInsert = Database['public']['Tables']['benefits']['Insert'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

export async function getEmployees() {
  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Erro ao buscar funcionários: ${error.message}`);
  }

  // Mapear os dados do banco para o formato esperado pela interface
  const mappedEmployees = employees?.map((emp: any) => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    role: emp.role,
    department: emp.department,
    status: emp.status,
    avatar: emp.avatar || '',
    managerId: emp.managerid,
    hireDate: emp.hiredate, // Mapear hiredate para hireDate
    salary: emp.salary,
    phone: emp.phone,
    address: emp.address,
    bank: emp.bank,
    bankAgency: emp.bankagency,
    bankAccount: emp.bankaccount,
    benefits: [] // Inicializar array vazio de benefícios
  })) || [];

  return mappedEmployees;
}

export async function getEmployee(id: string) {
  const { data: employee, error } = await supabase
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

export async function createEmployee(employeeData: any, benefits: any[]) {
  try {
    console.log('Dados recebidos para criação:', employeeData);
    
    // Separar os benefícios dos dados do funcionário
    const { benefits: _, ...employeeWithoutBenefits } = employeeData;
    
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
    const employeeForDB: EmployeeInsert = {
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
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert(employeeForDB)
      .select()
      .single();

    if (employeeError) {
      console.error('Erro ao inserir funcionário:', employeeError);
      throw new Error(`Erro ao criar funcionário: ${employeeError.message}`);
    }

    if (!employee) {
      throw new Error('Funcionário não foi criado');
    }

    console.log('Funcionário criado com sucesso:', employee);

    // Inserir os benefícios se existirem
    if (benefits && benefits.length > 0) {
      const benefitsForDB: BenefitInsert[] = benefits.map((benefit: any) => ({
        employee_id: employee.id,
        benefit_type: benefit.type || benefit.id,
        value: benefit.value ? parseFloat(benefit.value) : null
      }));

      const { error: benefitsError } = await supabase
        .from('benefits')
        .insert(benefitsForDB);

      if (benefitsError) {
        console.error('Erro ao inserir benefícios:', benefitsError);
        // Não falhar se os benefícios não foram inseridos
      }
    }

    return employee;
  } catch (error) {
    console.error('Erro detalhado ao criar funcionário:', error);
    throw error;
  }
}

export async function updateEmployee(id: string, employee: Partial<Employee>) {
  const { data, error } = await supabase
    .from('employees')
    .update(employee)
    .eq('id', id)
    .returns<Employee>()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar funcionário: ${error.message}`);
  }

  return data;
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar funcionário: ${error.message}`);
  }

  return true;
}

export async function getBenefits(employeeId: string) {
  const { data: benefits, error } = await supabase
    .from('benefits')
    .select('*')
    .returns<Benefit[]>()
    .eq('employee_id', employeeId);

  if (error) {
    throw new Error(`Erro ao buscar benefícios: ${error.message}`);
  }

  return benefits;
}

export async function createBenefit(benefit: Omit<Benefit, 'id'>) {
  const { data, error } = await supabase
    .from('benefits')
    .insert([benefit])
    .returns<Benefit>()
    .single();

  if (error) {
    throw new Error(`Erro ao criar benefício: ${error.message}`);
  }

  return data;
}

export async function updateBenefit(id: string, benefit: Partial<Benefit>) {
  const { data, error } = await supabase
    .from('benefits')
    .update(benefit)
    .eq('id', id)
    .returns<Benefit>()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar benefício: ${error.message}`);
  }

  return data;
}

export async function deleteBenefit(id: string) {
  const { error } = await supabase
    .from('benefits')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar benefício: ${error.message}`);
  }

  return true;
}

export async function getDocuments(employeeId: string) {
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .returns<Document[]>()
    .eq('employee_id', employeeId);

  if (error) {
    throw new Error(`Erro ao buscar documentos: ${error.message}`);
  }

  return documents;
}

export async function createDocument(document: Omit<Document, 'id'>) {
  const { data, error } = await supabase
    .from('documents')
    .insert([document])
    .returns<Document>()
    .single();

  if (error) {
    throw new Error(`Erro ao criar documento: ${error.message}`);
  }

  return data;
}

export async function updateDocument(id: string, document: Partial<Document>) {
  const { data, error } = await supabase
    .from('documents')
    .update(document)
    .eq('id', id)
    .returns<Document>()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar documento: ${error.message}`);
  }

  return data;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar documento: ${error.message}`);
  }

  return true;
}

export async function getPayslips(employeeId: string) {
  const { data: payslips, error } = await supabase
    .from('payslips')
    .select('*')
    .returns<Payslip[]>()
    .eq('employee_id', employeeId)
    .order('payment_date', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar holerites: ${error.message}`);
  }

  return payslips;
}

export async function getPayslip(id: string) {
  const { data: payslip, error } = await supabase
    .from('payslips')
    .select('*')
    .returns<Payslip>()
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar holerite: ${error.message}`);
  }

  return payslip;
}

export async function createPayslip(payslip: Omit<Payslip, 'id'>) {
  const { data, error } = await supabase
    .from('payslips')
    .insert([payslip])
    .returns<Payslip>()
    .single();

  if (error) {
    throw new Error(`Erro ao criar holerite: ${error.message}`);
  }

  return data;
}

export async function updatePayslip(id: string, payslip: Partial<Payslip>) {
  const { data, error } = await supabase
    .from('payslips')
    .update(payslip)
    .eq('id', id)
    .returns<Payslip>()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar holerite: ${error.message}`);
  }

  return data;
}

export async function deletePayslip(id: string) {
  const { error } = await supabase
    .from('payslips')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar holerite: ${error.message}`);
  }

  return true;
}
