-- Adicionar coluna tax_regime se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'tax_regime') THEN
        ALTER TABLE companies ADD COLUMN tax_regime text;
    END IF;
END $$;

-- Definir valor padrão para registros nulos
UPDATE companies 
SET tax_regime = 'Simples Nacional' 
WHERE tax_regime IS NULL;

-- Adicionar restrição NOT NULL
ALTER TABLE companies 
ALTER COLUMN tax_regime SET NOT NULL;

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Forçar o PostgREST a recarregar o schema
NOTIFY pgrst, 'reload schema';