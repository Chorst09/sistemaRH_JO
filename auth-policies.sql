-- Garante que o RLS está habilitado nas tabelas do schema public
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;

-- Remove políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Usuários autenticados podem ver empresas" ON public.companies;
DROP POLICY IF EXISTS "Usuários autenticados podem criar empresas" ON public.companies;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar empresas" ON public.companies;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar empresas" ON public.companies;

-- Cria políticas para a tabela companies
CREATE POLICY "Usuários autenticados podem ver empresas"
ON public.companies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem criar empresas"
ON public.companies FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar empresas"
ON public.companies FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar empresas"
ON public.companies FOR DELETE
TO authenticated
USING (true);

-- Notifica o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';