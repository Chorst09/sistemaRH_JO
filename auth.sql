-- Habilita as extensões necessárias (se ainda não estiverem habilitadas)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Garante que o usuário autenticado tem acesso ao schema public
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- Configura permissões padrão para novos objetos
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON FUNCTIONS TO authenticated;

-- Notifica o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';