# Como Resolver o Problema de Criação de Empresas

## Problema Identificado

O erro "não está salvando o cadastro de empresa" é causado por **políticas de Row Level Security (RLS)** no Supabase que estão bloqueando a inserção de dados na tabela `companies`.

### Diagnóstico Completo

✅ **Configuração do Supabase**: Correta  
✅ **Estrutura da tabela**: Correta  
✅ **Código da aplicação**: Funcionando  
❌ **Políticas RLS**: Bloqueando inserções  
❌ **Autenticação**: Usuário precisa estar logado  

## Solução em 3 Passos

### Passo 1: Executar Políticas RLS no Supabase

1. Acesse o **Dashboard do Supabase**
2. Vá para **SQL Editor**
3. Execute o conteúdo do arquivo `supabase-rls-policies.sql`:

```sql
-- Habilitar RLS na tabela companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários autenticados vejam empresas
CREATE POLICY "Allow authenticated users to view companies" ON companies
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados criem empresas
CREATE POLICY "Allow authenticated users to create companies" ON companies
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Permitir que usuários autenticados atualizem empresas
CREATE POLICY "Allow authenticated users to update companies" ON companies
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Permitir que usuários autenticados excluam empresas
CREATE POLICY "Allow authenticated users to delete companies" ON companies
    FOR DELETE 
    USING (auth.role() = 'authenticated');
```

### Passo 2: Verificar se o Usuário Está Logado

Antes de tentar criar uma empresa, certifique-se de que:

1. **Faça login** na aplicação (`/login`)
2. **Verifique** se aparece "Logado como: [seu-email]" na página de criação
3. **Confirme** que não há erros de autenticação no console

### Passo 3: Testar a Criação de Empresa

1. Acesse `/companies/new`
2. Preencha os dados da empresa
3. Clique em "Salvar Empresa"
4. Verifique se não há erros no console do navegador

## Scripts de Teste

### Testar Diagnóstico Completo
```bash
node scripts/test-company-creation.js
```

### Testar Políticas RLS
```bash
node scripts/test-rls-policies.js
```

## Alternativa Rápida (Menos Segura)

Se você quiser uma solução rápida para desenvolvimento, pode **desabilitar RLS** completamente:

```sql
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
```

⚠️ **Atenção**: Esta opção é menos segura e não é recomendada para produção.

## Verificação de Sucesso

Após aplicar as políticas RLS, você deve ver:

✅ **No console do navegador**:
```
=== EMPRESA CRIADA COM SUCESSO ===
Dados retornados: { id: "...", name: "...", ... }
```

✅ **Na interface**:
- Toast de sucesso: "Empresa criada com sucesso!"
- Redirecionamento para lista de empresas
- Nova empresa aparece na lista

❌ **Se ainda houver erro**:
- Verifique se executou todas as políticas SQL
- Confirme que o usuário está autenticado
- Execute os scripts de teste para diagnóstico

## Estrutura das Políticas RLS

As políticas criadas permitem que **usuários autenticados** possam:

- **SELECT**: Ver todas as empresas
- **INSERT**: Criar novas empresas  
- **UPDATE**: Editar empresas existentes
- **DELETE**: Excluir empresas

Usuários **não autenticados** são bloqueados em todas as operações.

## Troubleshooting

### Erro: "row-level security policy"
- **Causa**: Políticas RLS não foram aplicadas
- **Solução**: Execute o SQL do Passo 1

### Erro: "Você precisa estar logado"
- **Causa**: Usuário não está autenticado
- **Solução**: Faça login antes de criar empresa

### Erro: "permission denied"
- **Causa**: Políticas RLS muito restritivas
- **Solução**: Verifique se as políticas foram criadas corretamente

### Empresa não aparece na lista
- **Causa**: Política de SELECT pode estar faltando
- **Solução**: Execute todas as políticas RLS

## Logs Úteis

Para debug, verifique estes logs no console:

```javascript
// Autenticação
=== INICIANDO CRIAÇÃO DE EMPRESA ===
Usuário autenticado: usuario@email.com

// Dados enviados
Dados mapeados para o banco: { name: "...", cnpj: "...", ... }

// Sucesso
=== EMPRESA CRIADA COM SUCESSO ===
```

## Contato

Se o problema persistir após seguir todos os passos:

1. Execute `node scripts/test-company-creation.js`
2. Execute `node scripts/test-rls-policies.js`  
3. Compartilhe os logs dos scripts para análise