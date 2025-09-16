-- Criar tabela de empresas
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR NOT NULL,
    cnpj VARCHAR NOT NULL UNIQUE,
    taxRegime VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'Ativa',
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criar trigger para atualizar o updated_at da tabela companies
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas empresas de exemplo
INSERT INTO public.companies (name, cnpj, taxRegime, status, address)
VALUES 
('Empresa Exemplo LTDA', '12.345.678/0001-99', 'Simples Nacional', 'Ativa', 'Rua das Flores, 123 - Centro - São Paulo - SP - CEP: 01234-567'),
('Tech Solutions S.A.', '98.765.432/0001-10', 'Lucro Presumido', 'Ativa', 'Av. Paulista, 1000 - Bela Vista - São Paulo - SP - CEP: 01310-100'),
('Consultoria ABC LTDA', '11.222.333/0001-44', 'Lucro Real', 'Inativa', 'Rua do Comércio, 456 - Centro - Rio de Janeiro - RJ - CEP: 20040-020');

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para a tabela companies
CREATE POLICY "Usuários autenticados podem ver empresas" ON public.companies
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir empresas" ON public.companies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar empresas" ON public.companies
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar empresas" ON public.companies
    FOR DELETE USING (auth.role() = 'authenticated');