export type EmployeeBenefit = {
  id: string;
  value?: string;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Ativo' | 'De Licença' | 'Demitido';
  avatar: string;
  managerId?: string;
  hireDate: string;
  salary: number;
  phone: string;
  address: string;
  bank: string;
  bankAgency: string;
  bankAccount: string;
  benefits: EmployeeBenefit[];
};

export type AbsenceRequest = {
  id: string;
  employeeId: string;
  type: 'Férias' | 'Licença Médica' | 'Pessoal';
  startDate: string;
  endDate: string;
  status: 'Pendente' | 'Aprovado' | 'Negado';
  reason?: string;
  abonoPecuniario?: boolean;
};

export type Document = {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  url: string;
};

export type PayslipEarning = {
  description: string;
  amount: number;
};

export type PayslipDeduction = {
  description: string;
  amount: number;
};

export type Payslip = {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  paymentDate: string;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  url: string;
  earnings: PayslipEarning[];
  deductions: PayslipDeduction[];
};

export type Benefit = {
  id: string;
  name: string;
  description: string;
};

export type TaxRegime = 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';

export type Company = {
  id: string;
  name: string;
  cnpj: string;
  taxRegime: TaxRegime;
  status: 'Ativa' | 'Inativa';
  address?: string;
};
