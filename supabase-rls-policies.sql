-- =====================================================
-- RLS Policies for Companies Table
-- =====================================================
-- 
-- Este arquivo contém as políticas de Row Level Security (RLS)
-- necessárias para permitir que usuários autenticados gerenciem empresas.
-- 
-- Execute estes comandos no SQL Editor do seu dashboard do Supabase.
-- 

-- Primeiro, vamos verificar se RLS está habilitado na tabela companies
-- (Se não estiver, o comando abaixo irá habilitá-lo)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver conflitos (opcional)
-- DROP POLICY IF EXISTS "Allow authenticated users to view companies" ON companies;
-- DROP POLICY IF EXISTS "Allow authenticated users to create companies" ON companies;
-- DROP POLICY IF EXISTS "Allow authenticated users to update companies" ON companies;
-- DROP POLICY IF EXISTS "Allow authenticated users to delete companies" ON companies;

-- =====================================================
-- POLÍTICA 1: Permitir que usuários autenticados vejam empresas
-- =====================================================
CREATE POLICY "Allow authenticated users to view companies" ON companies
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICA 2: Permitir que usuários autenticados criem empresas
-- =====================================================
CREATE POLICY "Allow authenticated users to create companies" ON companies
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICA 3: Permitir que usuários autenticados atualizem empresas
-- =====================================================
CREATE POLICY "Allow authenticated users to update companies" ON companies
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICA 4: Permitir que usuários autenticados excluam empresas
-- =====================================================
CREATE POLICY "Allow authenticated users to delete companies" ON companies
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- VERIFICAÇÃO: Listar políticas criadas
-- =====================================================
-- Execute esta query para verificar se as políticas foram criadas corretamente:
-- 
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'companies';

-- =====================================================
-- ALTERNATIVA: Desabilitar RLS (menos seguro)
-- =====================================================
-- Se você preferir desabilitar completamente o RLS na tabela companies
-- (não recomendado para produção), execute o comando abaixo:
-- 
-- ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- TESTE: Verificar se as políticas funcionam
-- =====================================================
-- Após executar as políticas acima, teste com:
-- 
-- 1. Faça login na aplicação
-- 2. Tente criar uma empresa
-- 3. Se ainda houver erro, verifique os logs do Supabase
-- 
-- Para debug, você pode executar:
-- SELECT auth.role(), auth.uid(), auth.email();
-- 
-- Isso mostrará informações sobre o usuário atual.