export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  admission_date: string;
  birth_date: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type Benefit = {
  id: string;
  employee_id: string;
  name: string;
  description: string;
  value: number;
  type: string;
  status: 'active' | 'inactive';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  employee_id: string;
  name: string;
  description: string;
  type: string;
  url: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type Payslip = {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  payment_date: string;
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  url: string;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
};