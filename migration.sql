-- Criar tabela de funcionários
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    role VARCHAR NOT NULL,
    department VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'Ativo',
    avatar VARCHAR,
    managerId UUID REFERENCES public.employees(id),
    hireDate DATE NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    phone VARCHAR,
    address VARCHAR,
    bank VARCHAR,
    bankAgency VARCHAR,
    bankAccount VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar tabela de benefícios
CREATE TABLE IF NOT EXISTS public.benefits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    benefit_type VARCHAR NOT NULL,
    value DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar tabela de documentos
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    url VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar o updated_at
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_benefits_updated_at
    BEFORE UPDATE ON public.benefits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar políticas de segurança RLS (Row Level Security)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Políticas para employees
CREATE POLICY "Permitir acesso público aos funcionários"
ON public.employees FOR ALL USING (true);

-- Políticas para benefits
CREATE POLICY "Permitir acesso público aos benefícios"
ON public.benefits FOR ALL USING (true);

-- Políticas para documents
CREATE POLICY "Permitir acesso público aos documentos"
ON public.documents FOR ALL USING (true);

-- Inserir alguns dados de exemplo
INSERT INTO public.employees (name, email, role, department, status, hireDate, salary)
VALUES 
('João Silva', 'joao.silva@empresa.com', 'Desenvolvedor', 'TI', 'Ativo', '2023-01-15', 5000.00),
('Maria Santos', 'maria.santos@empresa.com', 'Designer', 'Marketing', 'Ativo', '2023-02-01', 4500.00),
('Pedro Oliveira', 'pedro.oliveira@empresa.com', 'Gerente', 'Vendas', 'Ativo', '2023-01-10', 7000.00);

-- Inserir alguns benefícios de exemplo
INSERT INTO public.benefits (employee_id, benefit_type, value)
SELECT 
    id as employee_id,
    'Vale Refeição' as benefit_type,
    500.00 as value
FROM public.employees
WHERE email = 'joao.silva@empresa.com';

INSERT INTO public.benefits (employee_id, benefit_type, value)
SELECT 
    id as employee_id,
    'Vale Transporte' as benefit_type,
    200.00 as value
FROM public.employees
WHERE email = 'maria.santos@empresa.com';

-- Criar tabela de catálogo de benefícios
CREATE TABLE IF NOT EXISTS public.benefits_catalog (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    hasValue BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar trigger para atualizar o updated_at da tabela benefits_catalog
CREATE TRIGGER update_benefits_catalog_updated_at
    BEFORE UPDATE ON public.benefits_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Política de segurança para benefits_catalog
ALTER TABLE public.benefits_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso público ao catálogo de benefícios"
ON public.benefits_catalog FOR ALL USING (true);

-- Inserir dados do catálogo de benefícios
INSERT INTO public.benefits_catalog (id, name, description, hasValue) VALUES
('plano_saude', 'Plano de Saúde', 'Cobertura médica completa para funcionários e dependentes', true),
('plano_odontologico', 'Plano Odontológico', 'Cobertura odontológica para funcionários e dependentes', true),
('vale_refeicao', 'Vale Refeição', 'Auxílio alimentação para refeições durante o expediente', true),
('vale_transporte', 'Vale Transporte', 'Auxílio transporte para deslocamento casa-trabalho', true),
('seguro_vida', 'Seguro de Vida', 'Seguro de vida em grupo para funcionários', true),
('previdencia_privada', 'Previdência Privada', 'Plano de previdência complementar', true),
('auxilio_creche', 'Auxílio Creche', 'Auxílio para despesas com creche/educação infantil', true);