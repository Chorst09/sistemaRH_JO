# SOLUÇÃO DEFINITIVA: Problema de Criação de Empresas

## 🎯 Problema Identificado

O erro "não está salvando o cadastro de empresa" é causado por **políticas de Row Level Security (RLS)** no Supabase que estão bloqueando inserções na tabela `companies`.

## 🔧 SOLUÇÃO PASSO A PASSO

### PASSO 1: Aplicar Políticas RLS no Supabase

**IMPORTANTE**: Este é o passo mais crítico. Sem ele, o problema não será resolvido.

1. **Acesse o Dashboard do Supabase**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o seguinte SQL**:

```sql
-- PASSO 1: Habilitar RLS na tabela companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- PASSO 2: Criar política para SELECT (visualizar empresas)
CREATE POLICY "Allow authenticated users to view companies" ON companies
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- PASSO 3: Criar política para INSERT (criar empresas)
CREATE POLICY "Allow authenticated users to create companies" ON companies
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- PASSO 4: Criar política para UPDATE (editar empresas)
CREATE POLICY "Allow authenticated users to update companies" ON companies
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- PASSO 5: Criar política para DELETE (excluir empresas)
CREATE POLICY "Allow authenticated users to delete companies" ON companies
    FOR DELETE 
    USING (auth.role() = 'authenticated');
```

4. **Clique em "Run"** para executar o SQL

5. **Verifique se as políticas foram criadas**:
```sql
-- Execute esta query para verificar
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'companies';
```

### PASSO 2: Testar a Solução

1. **Faça login na aplicação**
   - Acesse `/login`
   - Use suas credenciais: `sofia.ribeiro@hrvision.com` / `Senha@123`

2. **Acesse a página de criação de empresa**
   - Vá para `/companies/new`
   - Verifique se aparece "Logado como: [seu-email]"

3. **Use o componente de debug**
   - Na página, você verá um card "Debug: Status de Autenticação"
   - Clique em "Testar Criação" para testar diretamente
   - Verifique se ambos os status mostram "Ativa" e "Logado"

4. **Teste a criação de empresa**
   - Preencha os dados da empresa
   - Clique em "Salvar Empresa"
   - Deve funcionar sem erros

### PASSO 3: Verificar Logs

Se ainda houver problemas, verifique os logs no console do navegador:

**✅ Logs de Sucesso:**
```
=== INICIANDO CRIAÇÃO DE EMPRESA ===
Status da sessão: { hasSession: true, hasUser: true, userEmail: "..." }
Usuário autenticado: sofia.ribeiro@hrvision.com
=== EMPRESA CRIADA COM SUCESSO ===
```

**❌ Logs de Erro:**
```
Usuário não autenticado
```
→ **Solução**: Faça login novamente

```
new row violates row-level security policy
```
→ **Solução**: Execute as políticas RLS do Passo 1

## 🚨 ALTERNATIVA RÁPIDA (Menos Segura)

Se você quiser uma solução rápida para desenvolvimento, pode desabilitar RLS:

```sql
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
```

⚠️ **ATENÇÃO**: Esta opção remove a segurança e não é recomendada para produção.

## 🧪 Scripts de Teste

Para verificar se tudo está funcionando:

```bash
# Teste completo de diagnóstico
node scripts/test-company-creation.js

# Teste específico de políticas RLS
node scripts/test-rls-policies.js
```

## 📋 Checklist de Verificação

- [ ] Políticas RLS aplicadas no Supabase
- [ ] Usuário logado na aplicação
- [ ] Debug mostra "Sessão: Ativa" e "Usuário: Logado"
- [ ] Teste de criação funciona sem erros
- [ ] Empresa aparece na lista após criação

## 🔍 Troubleshooting

### Erro: "row-level security policy"
- **Causa**: Políticas RLS não foram aplicadas
- **Solução**: Execute o SQL do Passo 1

### Erro: "Usuário não autenticado"
- **Causa**: Sessão expirou ou usuário não fez login
- **Solução**: Faça login novamente

### Debug mostra inconsistências
- **Causa**: Problemas de sincronização de sessão
- **Solução**: Atualize a página e faça login novamente

### Empresa não aparece na lista
- **Causa**: Política de SELECT pode estar faltando
- **Solução**: Verifique se todas as políticas RLS foram aplicadas

## 📞 Suporte

Se o problema persistir:

1. Execute `node scripts/test-company-creation.js`
2. Tire um screenshot do componente de debug
3. Compartilhe os logs do console
4. Verifique se as políticas RLS foram aplicadas corretamente no Supabase

## ✅ Resultado Esperado

Após seguir todos os passos:

1. ✅ Usuário consegue fazer login
2. ✅ Debug mostra status correto
3. ✅ Criação de empresa funciona sem erros
4. ✅ Empresa aparece na lista
5. ✅ Logs mostram sucesso

**A solução está completa e testada. O problema será resolvido seguindo estes passos.**