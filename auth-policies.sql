-- Habilitar a extensão de autenticação do Supabase (caso ainda não esteja habilitada)
create extension if not exists "uuid-ossp";

-- Configurar políticas de autenticação
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários autenticados vejam seus próprios dados
CREATE POLICY "Users can view own data" ON auth.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Criar um usuário de teste com senha simples para debug
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'teste@teste.com',
  crypt('teste123', gen_salt('bf')),
  current_timestamp,
  current_timestamp,
  current_timestamp,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  current_timestamp,
  current_timestamp,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;