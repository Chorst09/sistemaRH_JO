-- Script para verificar e corrigir a tabela companies

-- 1. Verificar estrutura atual
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'companies'
);

-- 3. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    tax_regime TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Ativa',
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Garantir que tax_regime não é nulo
UPDATE companies 
SET tax_regime = 'Simples Nacional' 
WHERE tax_regime IS NULL OR tax_regime = '';

-- 5. Adicionar constraint para tax_regime se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'companies_tax_regime_check' 
        AND table_name = 'companies'
    ) THEN
        ALTER TABLE companies 
        ADD CONSTRAINT companies_tax_regime_check 
        CHECK (tax_regime IN ('Simples Nacional', 'Lucro Presumido', 'Lucro Real'));
    END IF;
END $$;

-- 6. Adicionar constraint para status se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'companies_status_check' 
        AND table_name = 'companies'
    ) THEN
        ALTER TABLE companies 
        ADD CONSTRAINT companies_status_check 
        CHECK (status IN ('Ativa', 'Inativa'));
    END IF;
END $$;

-- 7. Habilitar RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 8. Criar política para permitir todas as operações (ajustar conforme necessário)
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON companies;
CREATE POLICY "Enable all operations for authenticated users" ON companies
    FOR ALL USING (auth.role() = 'authenticated');

-- 9. Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;