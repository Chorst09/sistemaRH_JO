-- Migração para criar tabelas faltantes no sistema RH
-- Executar após a migração principal

-- Habilitar extensão UUID se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de holerites (payslips)
CREATE TABLE IF NOT EXISTS public.payslips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    payment_date DATE NOT NULL,
    gross_salary DECIMAL(10,2) NOT NULL,
    total_deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    url VARCHAR,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(employee_id, month, year)
);

-- Criar tabela de solicitações de ausência
CREATE TABLE IF NOT EXISTS public.absence_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    type VARCHAR NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CHECK (end_date >= start_date)
);

-- Criar tabela de solicitações de férias
CREATE TABLE IF NOT EXISTS public.vacation_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    type VARCHAR DEFAULT 'vacation',
    days_requested INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CHECK (end_date >= start_date),
    CHECK (days_requested > 0)
);

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_payslips_updated_at
    BEFORE UPDATE ON public.payslips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_absence_requests_updated_at
    BEFORE UPDATE ON public.absence_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vacation_requests_updated_at
    BEFORE UPDATE ON public.vacation_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absence_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Permitir acesso público aos holerites"
ON public.payslips FOR ALL USING (true);

CREATE POLICY "Permitir acesso público às solicitações de ausência"
ON public.absence_requests FOR ALL USING (true);

CREATE POLICY "Permitir acesso público às solicitações de férias"
ON public.vacation_requests FOR ALL USING (true);

-- Inserir dados de exemplo para holerites
INSERT INTO public.payslips (employee_id, month, year, payment_date, gross_salary, total_deductions, net_salary, status)
SELECT 
    id as employee_id,
    EXTRACT(MONTH FROM CURRENT_DATE) as month,
    EXTRACT(YEAR FROM CURRENT_DATE) as year,
    CURRENT_DATE as payment_date,
    salary as gross_salary,
    salary * 0.2 as total_deductions,
    salary * 0.8 as net_salary,
    'paid' as status
FROM public.employees
WHERE status = 'Ativo'
LIMIT 3;

-- Inserir dados de exemplo para solicitações de ausência
INSERT INTO public.absence_requests (employee_id, start_date, end_date, status, type, reason)
SELECT 
    id as employee_id,
    CURRENT_DATE + INTERVAL '7 days' as start_date,
    CURRENT_DATE + INTERVAL '8 days' as end_date,
    'pending' as status,
    'medical' as type,
    'Consulta médica' as reason
FROM public.employees
WHERE status = 'Ativo'
LIMIT 2;

-- Inserir dados de exemplo para solicitações de férias
INSERT INTO public.vacation_requests (employee_id, start_date, end_date, status, type, days_requested, reason)
SELECT 
    id as employee_id,
    CURRENT_DATE + INTERVAL '30 days' as start_date,
    CURRENT_DATE + INTERVAL '44 days' as end_date,
    'pending' as status,
    'vacation' as type,
    15 as days_requested,
    'Férias anuais' as reason
FROM public.employees
WHERE status = 'Ativo'
LIMIT 2;