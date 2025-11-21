# Quick Start - Configuração Rápida

## 1. Instalar dependências
```bash
npm install
```

## 2. Configurar Google Cloud Console

### Passo a passo:
1. Acesse: https://console.cloud.google.com/
2. Crie um projeto novo
3. Vá em **APIs & Services** > **Library**
4. Habilite:
   - Google Drive API
   - Google+ API
5. Vá em **APIs & Services** > **Credentials**
6. Clique **Create Credentials** > **OAuth 2.0 Client ID**
7. Configure:
   - Application type: **Web application**
   - Name: **HR Vision**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
8. Copie o **Client ID** e **Client Secret**

## 3. Configurar variáveis de ambiente

Edite `.env.local`:

```bash
# Cole os valores do Google Cloud Console
GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui

# Gere um secret com: openssl rand -base64 32
NEXTAUTH_SECRET=cole-o-resultado-do-comando-aqui

# URL local
NEXTAUTH_URL=http://localhost:3000
```

### Gerar NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 4. Iniciar o servidor
```bash
npm run dev
```

## 5. Testar
1. Abra: http://localhost:3000/login
2. Clique em "Entrar com Google"
3. Autorize o acesso ao Google Drive
4. Você será redirecionado para `/companies`

## Pronto! 🎉

Agora você tem:
- ✅ Login com Google
- ✅ Dados salvos no Google Drive
- ✅ Sem Supabase

## Próximos passos

Veja `MIGRATION_STATUS.md` para lista completa do que ainda precisa ser atualizado nos componentes.
