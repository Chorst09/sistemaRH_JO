-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Usuários autenticados podem ver empresas" ON public.companies;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir empresas" ON public.companies;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar empresas" ON public.companies;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar empresas" ON public.companies;

-- Criar política para permitir SELECT para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver empresas" ON public.companies
    FOR SELECT USING (auth.role() = 'authenticated');

-- Criar política para permitir INSERT para usuários autenticados
CREATE POLICY "Usuários autenticados podem inserir empresas" ON public.companies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Criar política para permitir UPDATE para usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar empresas" ON public.companies
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Criar política para permitir DELETE para usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar empresas" ON public.companies
    FOR DELETE USING (auth.role() = 'authenticated');

-- Forçar o PostgREST a recarregar o schema para reconhecer as mudanças
NOTIFY pgrst, 'reload schema';