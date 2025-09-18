import { createClient } from './supabase-client';

export async function getServerSession() {
  const supabase = createClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao obter sessão do servidor:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Erro na verificação de sessão do servidor:', error);
    return null;
  }
}

export async function refreshSession() {
  const supabase = createClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Erro ao atualizar sessão:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Erro na atualização de sessão:', error);
    return null;
  }
}

export async function signOut() {
  const supabase = createClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erro ao fazer logout:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro no processo de logout:', error);
    return false;
  }
}