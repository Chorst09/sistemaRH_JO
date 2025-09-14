import { Company } from '@/types';

export const companies: Company[] = [
    {
        id: '1',
        name: 'Tech Solutions Ltda.',
        cnpj: '12.345.678/0001-99',
        taxRegime: 'Simples Nacional',
        status: 'Ativa',
    },
    {
        id: '2',
        name: 'Inova Corp S.A.',
        cnpj: '98.765.432/0001-11',
        taxRegime: 'Lucro Real',
        status: 'Ativa',
    },
    {
        id: '3',
        name: 'Marketing Digital Experts',
        cnpj: '11.222.333/0001-44',
        taxRegime: 'Lucro Presumido',
        status: 'Inativa',
    },
];
