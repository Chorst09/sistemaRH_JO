// Arquivo de teste para verificar exportações
import { getCompanies, getCompany, createCompany, updateCompany, deleteCompany } from './company-data';

// Verificar se todas as exportações estão disponíveis
export const testExports = {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
};

// Não há exportação 'empresas' - apenas as funções acima
console.log('Exportações disponíveis:', Object.keys(testExports));