# Guia de Migração - Supabase para Google OAuth + Drive

## O que mudou?

- ✅ Autenticação agora usa **Google OAuth** (NextAuth.js)
- ✅ Dados salvos no **Google Drive** (arquivos JSON)
- ❌ Removido Supabase completamente

## Configuração

### 1. Configurar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure:
   - Application type: **Web application**
   - Authorized redirect URIs: 
     - `http://localhost:3000/api/auth/callback/google`
     - `https://seu-dominio.com/api/auth/callback/google` (produção)
6. Copie o **Client ID** e **Client Secret**

### 2. Habilitar APIs necessárias

No Google Cloud Console, habilite:
- Google Drive API
- Google+ API (para perfil do usuário)

### 3. Configurar variáveis de ambiente

Edite o arquivo `.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-um-secret-com-openssl-rand-base64-32
```

Para gerar o `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Instalar dependências

```bash
npm install
```

### 5. Iniciar o servidor

```bash
npm run dev
```

## Como funciona agora

### Autenticação

```typescript
import { signIn, signOut, useSession } from 'next-auth/react';

// Login
signIn('google');

// Logout
signOut();

// Verificar sessão
const { data: session } = useSession();
```

### Armazenamento de dados

```typescript
import { DataStorage } from '@/lib/data-storage';
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
const storage = new DataStorage(session.accessToken, session.user.email);

// Salvar empresa
await storage.saveCompany({ name: 'Empresa X', cnpj: '12345678000190' });

// Listar empresas
const companies = await storage.getCompanies();

// Atualizar empresa
await storage.updateCompany(id, { name: 'Novo Nome' });

// Deletar empresa
await storage.deleteCompany(id);
```

## Estrutura de dados no Google Drive

Os dados são salvos em uma pasta chamada `HRVision_Data` no Google Drive do usuário:

```
HRVision_Data/
├── companies_user@email.com.json
├── employees_user@email.com.json
├── payslips_user@email.com.json
└── ...
```

Cada arquivo é um JSON com array de objetos.

## Migração de dados existentes

Se você tinha dados no Supabase, precisará exportá-los e importá-los manualmente:

1. Exporte os dados do Supabase (SQL ou CSV)
2. Converta para o formato JSON esperado
3. Use a API para importar os dados

## Arquivos removidos

Você pode deletar estes arquivos (já não são usados):

- `src/lib/supabase.ts`
- `src/lib/supabase-client.ts`
- `src/lib/supabase-server.ts`
- `src/lib/env-validator.ts`
- `src/lib/startup-validation.ts`
- `src/lib/auth-error-handler.ts`
- `src/lib/auth-logger.ts`
- `src/lib/auth-session-logger.ts`
- `src/types/supabase.ts`
- `src/types/supabase-generated.ts`
- Todos os arquivos `.sql`

## Produção

Para deploy em produção:

1. Configure as variáveis de ambiente no seu provedor (Vercel, etc)
2. Adicione a URL de produção nas **Authorized redirect URIs** do Google Cloud Console
3. Atualize `NEXTAUTH_URL` para a URL de produção

## Limitações

- Google Drive tem limites de API (leitura/escrita)
- Não há queries complexas como SQL
- Performance pode ser menor para grandes volumes de dados

## Alternativa recomendada

Se precisar de um banco de dados mais robusto, considere usar **Firebase Firestore** ao invés do Google Drive. Ainda usa autenticação Google, mas com banco NoSQL adequado.
