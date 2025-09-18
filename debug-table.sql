-- Script para verificar a estrutura da tabela companies
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_companies FROM companies;

-- Verificar se há registros com tax_regime nulo
SELECT COUNT(*) as null_tax_regime FROM companies WHERE tax_regime IS NULL;