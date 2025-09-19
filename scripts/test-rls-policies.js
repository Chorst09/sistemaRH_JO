#!/usr/bin/env node

/**
 * Script para testar se as políticas RLS foram aplicadas corretamente
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

// Test with authentication
async function testWithAuth(supabase) {
  logInfo('Testing with authentication...');
  
  try {
    // Try to login with test credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'sofia.ribeiro@hrvision.com',
      password: 'Senha@123'
    });
    
    if (authError) {
      logError(`Authentication failed: ${authError.message}`);
      return false;
    }
    
    if (!authData.session) {
      logError('No session created after authentication');
      return false;
    }
    
    logSuccess(`Authenticated as: ${authData.user.email}`);
    
    // Now test company creation
    const testCompany = {
      name: 'Test Company RLS',
      cnpj: '12.345.678/0001-99',
      tax_regime: 'Simples Nacional',
      taxregime: 'Simples Nacional',
      status: 'Ativa',
      address: 'Test Address'
    };
    
    logInfo('Testing company creation with authenticated user...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('companies')
      .insert([testCompany])
      .select()
      .single();
    
    if (insertError) {
      logError(`Company creation failed: ${insertError.message}`);
      logError(`Error code: ${insertError.code}`);
      
      if (insertError.message.includes('row-level security policy')) {
        logError('RLS policies are still blocking the insert');
        logError('Make sure you have executed the RLS policies from supabase-rls-policies.sql');
        return false;
      }
      
      return false;
    }
    
    logSuccess('Company created successfully with authenticated user!');
    
    // Clean up test data
    if (insertData?.id) {
      await supabase.from('companies').delete().eq('id', insertData.id);
      logInfo('Test data cleaned up');
    }
    
    // Sign out
    await supabase.auth.signOut();
    logInfo('Signed out');
    
    return true;
    
  } catch (error) {
    logError(`Test with auth failed: ${error.message}`);
    return false;
  }
}

// Test without authentication
async function testWithoutAuth(supabase) {
  logInfo('Testing without authentication...');
  
  try {
    // Make sure we're not authenticated
    await supabase.auth.signOut();
    
    const testCompany = {
      name: 'Test Company No Auth',
      cnpj: '98.765.432/0001-10',
      tax_regime: 'Simples Nacional',
      taxregime: 'Simples Nacional',
      status: 'Ativa'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('companies')
      .insert([testCompany])
      .select()
      .single();
    
    if (insertError) {
      if (insertError.message.includes('row-level security policy')) {
        logSuccess('RLS correctly blocking unauthenticated users ✓');
        return true;
      } else {
        logWarning(`Unexpected error: ${insertError.message}`);
        return false;
      }
    }
    
    // If we get here, the insert succeeded without authentication
    logError('Company creation succeeded without authentication - RLS is not working!');
    
    // Clean up if somehow it was created
    if (insertData?.id) {
      await supabase.from('companies').delete().eq('id', insertData.id);
    }
    
    return false;
    
  } catch (error) {
    logError(`Test without auth failed: ${error.message}`);
    return false;
  }
}

// Check RLS status
async function checkRLSStatus(supabase) {
  logInfo('Checking RLS status...');
  
  try {
    // This query checks if RLS is enabled on the companies table
    const { data, error } = await supabase
      .rpc('check_rls_status', { table_name: 'companies' })
      .single();
    
    if (error) {
      logWarning('Could not check RLS status directly');
      logWarning('This is normal - the function might not exist');
      return true; // Continue with other tests
    }
    
    if (data?.rls_enabled) {
      logSuccess('RLS is enabled on companies table');
    } else {
      logWarning('RLS is disabled on companies table');
    }
    
    return true;
    
  } catch (error) {
    logWarning('Could not check RLS status');
    return true; // Continue with other tests
  }
}

// Main test function
async function testRLSPolicies() {
  log(`${colors.bold}🔒 RLS Policies Test${colors.reset}`);
  log('Testing Row Level Security policies for companies table\n');
  
  // Load environment
  const env = loadEnvironment();
  if (!env) {
    logError('Failed to load environment variables');
    process.exit(1);
  }
  
  // Create Supabase client
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  let allTestsPassed = true;
  
  // Test 1: Check RLS status
  if (!(await checkRLSStatus(supabase))) {
    allTestsPassed = false;
  }
  console.log('');
  
  // Test 2: Test without authentication (should fail)
  if (!(await testWithoutAuth(supabase))) {
    allTestsPassed = false;
  }
  console.log('');
  
  // Test 3: Test with authentication (should succeed)
  if (!(await testWithAuth(supabase))) {
    allTestsPassed = false;
  }
  
  console.log('');
  
  // Summary
  if (allTestsPassed) {
    logSuccess('🎉 All RLS tests passed!');
    logSuccess('✓ Unauthenticated users are blocked');
    logSuccess('✓ Authenticated users can create companies');
    logSuccess('Your RLS policies are working correctly!');
  } else {
    logError('❌ Some RLS tests failed.');
    logWarning('Please check the following:');
    logWarning('1. Make sure you executed the SQL from supabase-rls-policies.sql');
    logWarning('2. Verify that RLS is enabled on the companies table');
    logWarning('3. Check that the policies were created correctly');
    logWarning('4. Ensure the test user credentials are correct');
  }
}

// Run the tests
if (require.main === module) {
  testRLSPolicies().catch(error => {
    logError(`RLS test failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testRLSPolicies,
  testWithAuth,
  testWithoutAuth,
  checkRLSStatus
};