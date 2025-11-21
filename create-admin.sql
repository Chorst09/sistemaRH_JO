-- Habilitar as extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Remover usuário admin se já existir
DELETE FROM auth.users WHERE email = 'admin@hrvision.com';

-- Criar usuário admin com senha criptografada (senha: Admin@123)
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
  recovery_token,
  confirmed_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'admin@hrvision.com',
  crypt('Admin@123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Administrador"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  NOW()
);

-- Adicionar identidade para o usuário
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) 
SELECT 
  id,
  id,
  format('{"sub":"%s","email":"%s","email_verified":true}', id::text, email)::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@hrvision.com';

-- Garantir que o usuário tenha as permissões corretas
UPDATE auth.users
SET is_sso_user = false,
    confirmed_at = NOW(),
    email_confirmed_at = NOW(),
    role = 'authenticated'
WHERE email = 'admin@hrvision.com';

-- Configurar políticas de segurança
ALTER ROLE authenticated;