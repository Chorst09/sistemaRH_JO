-- Verificar EXATAMENTE quais colunas existem na tabela companies
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar constraints NOT NULL
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'companies'
AND tc.table_schema = 'public'
AND tc.constraint_type = 'NOT NULL';

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_records FROM companies;

-- Mostrar um exemplo de registro se existir
SELECT * FROM companies LIMIT 1;

-- Tentar descobrir qual coluna realmente existe fazendo uma query
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'tax_regime') 
        THEN 'tax_regime EXISTS' 
        ELSE 'tax_regime NOT EXISTS' 
    END as tax_regime_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'taxregime') 
        THEN 'taxregime EXISTS' 
        ELSE 'taxregime NOT EXISTS' 
    END as taxregime_status;