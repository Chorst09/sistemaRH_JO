export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: 'Engenharia' | 'Marketing' | 'Vendas' | 'Recursos Humanos' | 'Design';
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

export type Payslip = {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  paymentDate: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  url: string;
};
