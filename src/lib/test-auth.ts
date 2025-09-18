import { createClient } from './supabase-client';

export async function testSupabaseConnection() {
  const supabase = createClient();
  
  console.log('🔍 Testando conexão com Supabase...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  
  try {
    // Testa a conexão básica
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return false;
    }
    
    console.log('✅ Conexão estabelecida com sucesso');
    console.log('Sessão atual:', data.session ? 'Ativa' : 'Inativa');
    
    return true;
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    return false;
  }
}

export async function testAuthFlow() {
  const supabase = createClient();
  
  console.log('🔍 Testando fluxo de autenticação...');
  
  try {
    // Testa o listener de mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
    });
    
    // Testa obter usuário atual
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error && error.message !== 'Auth session missing!') {
      console.error('❌ Erro ao obter usuário:', error);
      return false;
    }
    
    console.log('✅ Fluxo de autenticação funcionando');
    console.log('Usuário atual:', user ? user.email : 'Nenhum');
    
    // Limpa o listener
    subscription.unsubscribe();
    
    return true;
  } catch (error) {
    console.error('❌ Erro no teste de fluxo:', error);
    return false;
  }
}