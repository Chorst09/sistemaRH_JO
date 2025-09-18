# HR Vision

Um sistema de RH avançado para empresas modernas.

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

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

## Tecnologias

- Next.js 14
- Supabase (Autenticação e Banco de Dados)
- Tailwind CSS
- shadcn/ui
