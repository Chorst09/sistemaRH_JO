# Design Document

## Overview

O problema de autenticação está sendo causado por uma configuração incorreta das variáveis de ambiente do Supabase. A solução envolve corrigir as URLs, implementar validação de configuração e melhorar o tratamento de erros.

## Architecture

### Current Issue
- `NEXT_PUBLIC_SUPABASE_URL` está definida como `https://sistema-rh-jo.vercel.app/dashboard` (URL do Vercel)
- Deveria ser a URL do projeto Supabase no formato `https://[project-ref].supabase.co`

### Solution Architecture
```
Environment Variables → Validation Layer → Supabase Client → Authentication
```

## Components and Interfaces

### 1. Environment Configuration Validator
```typescript
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
}
```

### 2. Enhanced Error Handler
```typescript
interface AuthError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
```

### 3. Supabase Client Factory
- Centralizar a criação do cliente Supabase
- Aplicar validação antes da criação
- Fornecer fallbacks e tratamento de erro

## Data Models

### Configuration Schema
```typescript
type EnvironmentConfig = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}
```

### Error Logging Schema
```typescript
type AuthErrorLog = {
  timestamp: string;
  error_type: 'config' | 'auth' | 'network';
  message: string;
  status_code?: number;
  user_agent?: string;
}
```

## Error Handling

### 1. Configuration Errors
- Validar formato da URL do Supabase
- Verificar se a chave anônima está presente
- Alertar sobre configurações de desenvolvimento vs produção

### 2. Authentication Errors
- Capturar erros 400/401/403 com contexto
- Implementar retry logic para erros de rede
- Logs estruturados para debugging

### 3. Runtime Errors
- Fallback gracioso quando Supabase não está disponível
- Mensagens de erro user-friendly
- Redirecionamento apropriado em caso de falha

## Testing Strategy

### 1. Unit Tests
- Validação de configuração
- Formatação de URLs
- Tratamento de erros

### 2. Integration Tests
- Conexão com Supabase usando configurações corretas
- Fluxo completo de autenticação
- Cenários de erro (URLs inválidas, chaves incorretas)

### 3. Environment Tests
- Verificar configurações em diferentes ambientes
- Validar variáveis de ambiente no build
- Testes de conectividade com Supabase

## Implementation Notes

### Immediate Fixes Needed
1. Corrigir `NEXT_PUBLIC_SUPABASE_URL` para usar a URL correta do Supabase
2. Adicionar validação de configuração no startup
3. Melhorar logs de erro na página de login

### Configuration Management
- Usar validação runtime das variáveis de ambiente
- Implementar diferentes configurações para dev/staging/prod
- Documentar as configurações necessárias

### Security Considerations
- Não expor chaves privadas no frontend
- Validar origem das requisições
- Implementar rate limiting se necessário