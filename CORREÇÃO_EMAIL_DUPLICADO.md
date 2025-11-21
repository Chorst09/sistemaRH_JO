# Correção do Erro de Email Duplicado

## Problema Identificado
```
duplicate key value violates unique constraint "employees_email_key"
```

## Causa
A tabela `employees` tem uma constraint de unicidade no campo `email`, impedindo que dois funcionários tenham o mesmo email.

## Correções Implementadas

### 1. Verificação Prévia de Email
```typescript
// Verificar se o email já existe antes de tentar inserir
const { data: existingEmployee } = await supabase
  .from('employees')
  .select('id, email')
  .eq('email', employeeData.email)
  .single();

if (existingEmployee) {
  throw new Error('Este email já está sendo usado por outro funcionário...');
}
```

### 2. Tratamento Específico de Erros
```typescript
// Tratar erro de email duplicado
if (employeeError.code === '23505' && employeeError.message.includes('employees_email_key')) {
  throw new Error('Este email já está sendo usado por outro funcionário...');
}
```

### 3. Mensagens de Erro Melhoradas
- ✅ Mensagem específica para email duplicado
- ✅ Mensagem genérica para outros erros de duplicação
- ✅ Tratamento na interface com mensagens claras

### 4. Correção da Assinatura da Função
```typescript
// ANTES
export async function createEmployee(employeeData: any, benefits: any[])

// DEPOIS
export async function createEmployee(employeeData: any, benefits?: any[])
```

### 5. Melhor Processamento de Benefícios
```typescript
// Usar benefícios do parâmetro ou dos dados do funcionário
const benefitsToProcess = benefits || benefitsFromData || [];
```

## Como Funciona Agora

1. **Verificação Prévia**: Antes de tentar criar, verifica se o email já existe
2. **Erro Claro**: Se existir, mostra mensagem específica
3. **Fallback**: Se a verificação falhar, o erro de constraint ainda é tratado
4. **Interface Amigável**: Usuário vê mensagem clara sobre o problema

## Teste

1. **Tente criar um funcionário** com email novo - deve funcionar
2. **Tente criar outro funcionário** com o mesmo email - deve mostrar erro claro
3. **Verifique a mensagem** - deve dizer "Este email já está sendo usado..."

## Arquivos Modificados
- `src/lib/data.ts` - Verificação e tratamento de erros
- `src/app/(app)/employees/new/page.tsx` - Mensagens de erro melhoradas