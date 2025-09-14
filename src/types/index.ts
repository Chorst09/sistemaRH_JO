export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: 'Engineering' | 'Marketing' | 'Sales' | 'Human Resources' | 'Design';
  status: 'Active' | 'On Leave' | 'Terminated';
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
  type: 'Vacation' | 'Sick Leave' | 'Personal';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Denied';
  reason?: string;
};

export type Document = {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  url: string;
};
