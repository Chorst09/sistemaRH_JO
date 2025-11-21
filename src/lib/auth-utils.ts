import { createClient } from './supabase-client';
import { handleAuthError } from './auth-error-handler';

export async function getServerSession() {
  const supabase = createClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      handleAuthError(error, { context: 'get_server_session' });
      return null;
    }
    
    return session;
  } catch (error) {
    handleAuthError(error, { context: 'get_server_session_exception' });
    return null;
  }
}

export async function refreshSession() {
  const supabase = createClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      handleAuthError(error, { context: 'refresh_session' });
      return null;
    }
    
    return session;
  } catch (error) {
    handleAuthError(error, { context: 'refresh_session_exception' });
    return null;
  }
}

export async function signOut() {
  const supabase = createClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      handleAuthError(error, { context: 'sign_out' });
      return false;
    }
    
    return true;
  } catch (error) {
    handleAuthError(error, { context: 'sign_out_exception' });
    return false;
  }
}