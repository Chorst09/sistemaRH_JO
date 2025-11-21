-- Verificar os nomes exatos das colunas na tabela companies
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se existe alguma empresa na tabela para ver a estrutura
SELECT * FROM companies LIMIT 1;

-- Tentar inserir um registro de teste para confirmar os nomes das colunas
-- (comentado para não executar automaticamente)
/*
INSERT INTO companies (name, cnpj, taxregime, status, address) 
VALUES ('Teste', '12345678000199', 'Simples Nacional', 'Ativa', 'Endereço Teste');
*/