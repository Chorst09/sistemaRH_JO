-- Configurar autenticação básica
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Remover usuários existentes para evitar conflitos
DELETE FROM auth.users WHERE email IN ('sofia.ribeiro@hrvision.com', 'teste@teste.com');

-- Criar usuário com senha conhecida
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
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
    'sofia.ribeiro@hrvision.com',
    crypt('Senha@123', gen_salt('bf')),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Sofia Ribeiro","role":"CEO"}',
    FALSE,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Configurar políticas de autenticação
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários autenticados vejam seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" ON auth.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Permitir que usuários atualizem seus próprios dados
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON auth.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Configurar identities para o usuário
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
    json_build_object('sub', id::text, 'email', email),
    'email',
    NOW(),
    NOW(),
    NOW()
FROM auth.users
WHERE email = 'sofia.ribeiro@hrvision.com'
ON CONFLICT (provider, id) DO NOTHING;