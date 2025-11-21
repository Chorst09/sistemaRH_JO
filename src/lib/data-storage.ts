import { GoogleDriveStorage } from './google-drive';

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  createdAt: string;
  userId: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  companyId: string;
  position: string;
  salary: number;
  createdAt: string;
}

export class DataStorage {
  private drive: GoogleDriveStorage;
  private userId: string;

  constructor(accessToken: string, userId: string) {
    this.drive = new GoogleDriveStorage(accessToken);
    this.userId = userId;
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    const data = await this.drive.getData(`companies_${this.userId}.json`);
    return data || [];
  }

  async saveCompany(company: Omit<Company, 'id' | 'createdAt' | 'userId'>): Promise<Company> {
    const companies = await this.getCompanies();
    const newCompany: Company = {
      ...company,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      userId: this.userId,
    };
    companies.push(newCompany);
    await this.drive.saveData(`companies_${this.userId}.json`, companies);
    return newCompany;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
    const companies = await this.getCompanies();
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    companies[index] = { ...companies[index], ...updates };
    await this.drive.saveData(`companies_${this.userId}.json`, companies);
    return companies[index];
  }

  async deleteCompany(id: string): Promise<boolean> {
    const companies = await this.getCompanies();
    const filtered = companies.filter(c => c.id !== id);
    if (filtered.length === companies.length) return false;
    
    await this.drive.saveData(`companies_${this.userId}.json`, filtered);
    return true;
  }

  // Employees
  async getEmployees(companyId?: string): Promise<Employee[]> {
    const data = await this.drive.getData(`employees_${this.userId}.json`);
    const employees = data || [];
    return companyId ? employees.filter((e: Employee) => e.companyId === companyId) : employees;
  }

  async saveEmployee(employee: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee> {
    const employees = await this.getEmployees();
    const newEmployee: Employee = {
      ...employee,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    employees.push(newEmployee);
    await this.drive.saveData(`employees_${this.userId}.json`, employees);
    return newEmployee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
    const employees = await this.getEmployees();
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    employees[index] = { ...employees[index], ...updates };
    await this.drive.saveData(`employees_${this.userId}.json`, employees);
    return employees[index];
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const employees = await this.getEmployees();
    const filtered = employees.filter(e => e.id !== id);
    if (filtered.length === employees.length) return false;
    
    await this.drive.saveData(`employees_${this.userId}.json`, filtered);
    return true;
  }
}
