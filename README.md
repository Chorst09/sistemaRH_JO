# Sistema RH

Sistema de Recursos Humanos desenvolvido para a JO Ferragens.

## Configuração do Ambiente

### Variáveis de Ambiente no Vercel

Para configurar as variáveis de ambiente no Vercel, siga os passos abaixo:

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Selecione o projeto do Sistema RH
3. Vá para a aba "Settings"
4. Na seção "Environment Variables", adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

Você pode encontrar esses valores no [Dashboard do Supabase](https://app.supabase.com):
1. Selecione seu projeto
2. Vá para "Settings" > "API"
3. Copie os valores de "Project URL" e "anon public" para as respectivas variáveis de ambiente

### Desenvolvimento Local

Para rodar o projeto localmente:

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/sistemaRH_JO.git
cd sistemaRH_JO
```

2. Instale as dependências
```bash
npm install
```

3. Crie um arquivo `.env.local` na raiz do projeto com as mesmas variáveis de ambiente do Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000)

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)

## Estrutura do Projeto

```
src/
├── ai/              # Configurações e fluxos de IA
├── app/             # Rotas e páginas da aplicação
├── components/      # Componentes reutilizáveis
├── hooks/           # Hooks personalizados
├── lib/            # Funções utilitárias e configurações
└── types/          # Definições de tipos TypeScript
```

## Funcionalidades

- Gestão de funcionários
- Controle de benefícios
- Organograma
- Relatórios e gráficos
- Simuladores (férias, rescisão, etc.)
- Upload e gestão de documentos
- Autenticação e autorização
