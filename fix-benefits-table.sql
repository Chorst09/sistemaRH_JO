-- Script para verificar e corrigir a tabela benefits_catalog

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'benefits_catalog'
);

-- 2. Verificar estrutura atual
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'benefits_catalog' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS benefits_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    has_value BOOLEAN DEFAULT true
);

-- 4. Inserir dados padrão se a tabela estiver vazia
INSERT INTO benefits_catalog (id, name, description, has_value) 
VALUES 
    ('plano_saude', 'Plano de Saúde', 'Cobertura médica completa para funcionários e dependentes', true),
    ('plano_odontologico', 'Plano Odontológico', 'Cobertura odontológica para funcionários e dependentes', true),
    ('vale_refeicao', 'Vale Refeição', 'Auxílio alimentação para refeições durante o expediente', true),
    ('vale_transporte', 'Vale Transporte', 'Auxílio transporte para deslocamento casa-trabalho', true),
    ('seguro_vida', 'Seguro de Vida', 'Seguro de vida em grupo para funcionários', true),
    ('previdencia_privada', 'Previdência Privada', 'Plano de previdência complementar', true),
    ('auxilio_creche', 'Auxílio Creche', 'Auxílio para despesas com creche/educação infantil', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    has_value = EXCLUDED.has_value;

-- 5. Garantir que todos os registros tenham has_value = true
UPDATE benefits_catalog 
SET has_value = true 
WHERE has_value IS NULL OR has_value = false;

-- 6. Verificar dados finais
SELECT * FROM benefits_catalog ORDER BY name;

-- 7. Habilitar RLS se necessário
ALTER TABLE benefits_catalog ENABLE ROW LEVEL SECURITY;

-- 8. Criar política para permitir leitura
DROP POLICY IF EXISTS "Enable read access for all users" ON benefits_catalog;
CREATE POLICY "Enable read access for all users" ON benefits_catalog
    FOR SELECT USING (true);

-- 9. Criar política para operações autenticadas
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON benefits_catalog;
CREATE POLICY "Enable all operations for authenticated users" ON benefits_catalog
    FOR ALL USING (auth.role() = 'authenticated');