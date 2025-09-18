# Correção do Erro de Criação de Empresa

## Problema Identificado
```
null value in column "taxregime" of relation "companies" violates not-null constraint
```

## Causa Raiz
O campo `tax_regime` na tabela `companies` está configurado como NOT NULL, mas pode estar recebendo valores nulos ou vazios.

## Correções Implementadas

### 1. Validação Robusta na Função `createCompany`
- ✅ Validação e limpeza de dados antes do envio
- ✅ Verificação explícita de campos obrigatórios
- ✅ Logs detalhados para debug
- ✅ Tratamento específico para erros de constraint

### 2. Arquivos de Debug e Teste
- ✅ `src/lib/test-company-creation.ts` - Testes de criação
- ✅ `debug-table.sql` - Script para verificar estrutura
- ✅ `fix-companies-table.sql` - Script para corrigir tabela
- ✅ Componente de debug atualizado

### 3. Verificações Implementadas
- Validação de regime tributário (apenas valores válidos)
- Validação de status (apenas valores válidos)
- Limpeza de strings (trim)
- Verificação de campos não nulos

## Como Testar

### 1. Usar o Componente de Debug
Adicione temporariamente na página de criação de empresa:
```tsx
import { AuthDebug } from '@/components/debug/auth-debug';

// No final da página
<AuthDebug />
```

### 2. Verificar Logs no Console
Ao tentar criar uma empresa, verifique os logs:
- "=== INICIANDO CRIAÇÃO DE EMPRESA ==="
- "Dados recebidos:"
- "Validação tax_regime:"
- "Dados mapeados para o banco:"

### 3. Executar Script SQL (se necessário)
Se o problema persistir, execute o script `fix-companies-table.sql` no Supabase SQL Editor.

## Valores Válidos

### Regime Tributário
- "Simples Nacional"
- "Lucro Presumido" 
- "Lucro Real"

### Status
- "Ativa"
- "Inativa"

## Próximos Passos

1. **Teste a criação de empresa** com os novos logs
2. **Verifique o console** para identificar onde está o problema
3. **Execute o script SQL** se necessário para corrigir a estrutura da tabela
4. **Remova os componentes de debug** após resolver

## Arquivos Modificados
- `src/lib/company-data.ts` - Validação melhorada
- `src/components/debug/auth-debug.tsx` - Testes adicionais
- `src/lib/test-company-creation.ts` - Novo arquivo de teste

## Arquivos Criados
- `debug-table.sql` - Verificação da estrutura
- `fix-companies-table.sql` - Correção da tabela
- `CORREÇÃO_EMPRESA.md` - Este documento