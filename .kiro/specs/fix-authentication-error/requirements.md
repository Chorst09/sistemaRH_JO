# Requirements Document

## Introduction

O sistema está apresentando erro 400 durante o processo de login devido a configuração incorreta das variáveis de ambiente do Supabase. A URL do Supabase está apontando para o domínio do Vercel em vez da URL correta do projeto Supabase, causando falhas na autenticação.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero conseguir fazer login sem erros 400, para que eu possa acessar o sistema normalmente.

#### Acceptance Criteria

1. WHEN o usuário tenta fazer login THEN o sistema SHALL usar a URL correta do Supabase para autenticação
2. WHEN as variáveis de ambiente são carregadas THEN o sistema SHALL validar se as URLs do Supabase estão no formato correto
3. WHEN ocorre um erro de autenticação THEN o sistema SHALL exibir mensagens de erro mais específicas para facilitar o debug

### Requirement 2

**User Story:** Como um desenvolvedor, eu quero ter configurações de ambiente corretas e validadas, para que o sistema funcione tanto em desenvolvimento quanto em produção.

#### Acceptance Criteria

1. WHEN o sistema inicia THEN o sistema SHALL verificar se todas as variáveis de ambiente necessárias estão definidas
2. WHEN as variáveis de ambiente são definidas THEN o sistema SHALL validar se estão no formato correto (URLs válidas)
3. IF as variáveis de ambiente estão incorretas THEN o sistema SHALL exibir erros claros sobre qual configuração está errada

### Requirement 3

**User Story:** Como um administrador do sistema, eu quero ter logs detalhados de erros de autenticação, para que eu possa diagnosticar problemas rapidamente.

#### Acceptance Criteria

1. WHEN ocorre um erro de autenticação THEN o sistema SHALL registrar logs detalhados incluindo status code, mensagem e timestamp
2. WHEN há problemas de configuração THEN o sistema SHALL alertar sobre variáveis de ambiente incorretas
3. WHEN o sistema está em produção THEN o sistema SHALL mascarar informações sensíveis nos logs mas manter informações úteis para debug