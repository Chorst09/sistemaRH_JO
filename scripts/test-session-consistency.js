#!/usr/bin/env node

/**
 * Script para testar consistência de sessão entre diferentes clientes Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Load environment variables
function loadEnvironment() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    logError('No .env.local file found');
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').replace(/^["']|["']$/g, '');
    }
  });

  return envVars;
}

// Test session consistency
async function testSessionConsistency() {
  log(`${colors.bold}🔄 Session Consistency Test${colors.reset}`);
  log('Testing if session is consistent across different Supabase clients\n');
  
  // Load environment
  const env = loadEnvironment();
  if (!env) {
    logError('Failed to load environment variables');
    process.exit(1);
  }
  
  // Create two separate clients (simulating the issue)
  const client1 = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key);
            }
            return null;
          },
          setItem: (key, value) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value);
            }
          },
          removeItem: (key) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key);
            }
          }
        }
      }
    }
  );
  
  const client2 = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key);
            }
            return null;
          },
          setItem: (key, value) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value);
            }
          },
          removeItem: (key) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key);
            }
          }
        }
      }
    }
  );
  
  try {
    // Step 1: Login with client1
    logInfo('Step 1: Logging in with client1...');
    const { data: authData, error: authError } = await client1.auth.signInWithPassword({
      email: 'sofia.ribeiro@hrvision.com',
      password: 'Senha@123'
    });
    
    if (authError) {
      logError(`Login failed: ${authError.message}`);
      return false;
    }
    
    if (!authData.session) {
      logError('No session created after login');
      return false;
    }
    
    logSuccess(`Logged in with client1: ${authData.user.email}`);
    logInfo(`Session ID: ${authData.session.access_token.substring(0, 20)}...`);
    
    // Step 2: Check session with client1
    logInfo('Step 2: Checking session with client1...');
    const { data: { session: session1 }, error: error1 } = await client1.auth.getSession();
    
    if (error1) {
      logError(`Client1 session check failed: ${error1.message}`);
    } else if (session1) {
      logSuccess(`Client1 has session: ${session1.user.email}`);
      logInfo(`Client1 Session ID: ${session1.access_token.substring(0, 20)}...`);
    } else {
      logError('Client1 has no session');
    }
    
    // Step 3: Check session with client2
    logInfo('Step 3: Checking session with client2...');
    const { data: { session: session2 }, error: error2 } = await client2.auth.getSession();
    
    if (error2) {
      logError(`Client2 session check failed: ${error2.message}`);
    } else if (session2) {
      logSuccess(`Client2 has session: ${session2.user.email}`);
      logInfo(`Client2 Session ID: ${session2.access_token.substring(0, 20)}...`);
      
      // Compare sessions
      if (session1 && session2) {
        if (session1.access_token === session2.access_token) {
          logSuccess('✓ Sessions are identical - consistency maintained');
        } else {
          logWarning('⚠️ Sessions are different - potential consistency issue');
          logInfo(`Client1 token: ${session1.access_token.substring(0, 50)}...`);
          logInfo(`Client2 token: ${session2.access_token.substring(0, 50)}...`);
        }
      }
    } else {
      logError('Client2 has no session - consistency issue!');
      logError('This means the session is not being shared between clients');
    }
    
    // Step 4: Test company creation with client2
    if (session2) {
      logInfo('Step 4: Testing company creation with client2...');
      
      const testCompany = {
        name: 'Test Session Consistency',
        cnpj: '11.111.111/0001-11',
        tax_regime: 'Simples Nacional',
        taxregime: 'Simples Nacional',
        status: 'Ativa'
      };
      
      const { data: insertData, error: insertError } = await client2
        .from('companies')
        .insert([testCompany])
        .select()
        .single();
      
      if (insertError) {
        logError(`Company creation failed: ${insertError.message}`);
        
        if (insertError.message.includes('row-level security policy')) {
          logError('RLS is blocking the insert - session might not be recognized');
        }
      } else {
        logSuccess('Company created successfully with client2!');
        
        // Clean up
        if (insertData?.id) {
          await client2.from('companies').delete().eq('id', insertData.id);
          logInfo('Test data cleaned up');
        }
      }
    }
    
    // Step 5: Logout
    logInfo('Step 5: Logging out...');
    await client1.auth.signOut();
    logInfo('Logged out');
    
    return true;
    
  } catch (error) {
    logError(`Session consistency test failed: ${error.message}`);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testSessionConsistency().catch(error => {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testSessionConsistency
};