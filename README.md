# HR Vision

Um sistema de RH avançado para empresas modernas.

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

**⚠️ IMPORTANTE**: A configuração incorreta das variáveis de ambiente é a causa mais comum de erros de autenticação.

Crie um arquivo `.env.local` na raiz do projeto:
```bash
# URL do seu projeto Supabase (OBRIGATÓRIO)
# Formato correto: https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://seu-project-ref.supabase.co

# Chave anônima do Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
```

**Como obter as credenciais corretas**:
1. Acesse o [Painel do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie a **Project URL** e a chave **anon public**

**Validar configuração**:
```bash
# Valide sua configuração antes de iniciar
npm run validate-env
```

**Formatos incorretos comuns** (evite):
- ❌ URLs do Vercel: `https://meu-app.vercel.app`
- ❌ URLs locais: `http://localhost:3000`
- ❌ URLs do dashboard: `https://supabase.com/dashboard/project/abc`

Para mais detalhes, consulte: [Guia de Configuração](./docs/environment-setup.md)

4. Configure o Supabase:
- Execute os scripts SQL na seguinte ordem no SQL Editor do Supabase:
  1. `supabase/migrations/auth.sql`
  2. `supabase/migrations/auth-policies.sql`
  3. `supabase/migrations/companies-migration.sql`
  4. `supabase/migrations/companies-policies.sql`
  5. `supabase/migrations/create-initial-user.sql`

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Credenciais Iniciais

- Email: admin@hrvision.com
- Senha: Admin@123

## Estrutura do Projeto

- `src/app/` - Páginas e layouts da aplicação
- `src/components/` - Componentes reutilizáveis
- `src/lib/` - Utilitários e configurações
- `src/hooks/` - Hooks personalizados
- `supabase/` - Scripts SQL e migrações

## Solução de Problemas

### Erros Comuns de Autenticação

Se você está enfrentando problemas de login ou erros 400:

1. **Verifique sua configuração**:
   ```bash
   npm run validate-env
   ```

2. **Erros mais comuns**:
   - URL do Supabase no formato incorreto
   - Uso de URL do Vercel em vez da URL do Supabase
   - Chave anônima de projeto diferente da URL

3. **Guias detalhados**:
   - [Guia de Configuração do Ambiente](./docs/environment-setup.md)
   - [Guia de Solução de Problemas de Autenticação](./docs/authentication-troubleshooting.md)
   - [Validação de Ambiente](./docs/environment-validation.md)

### Suporte

Se ainda estiver com problemas:
1. Execute `npm run validate-env` e compartilhe a saída
2. Verifique o console do navegador para mensagens de erro
3. Consulte os guias de documentação na pasta `docs/`

## Tecnologias

- Next.js 14
- Supabase (Autenticação e Banco de Dados)
- Tailwind CSS
- shadcn/ui
