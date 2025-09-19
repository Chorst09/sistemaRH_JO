#!/usr/bin/env node

/**
 * Script para testar e diagnosticar problemas na criação de empresas
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

// Test database connection
async function testConnection(supabase) {
  logInfo('Testing database connection...');
  
  try {
    const { data, error } = await supabase.from('companies').select('count').limit(1);
    
    if (error) {
      logError(`Connection test failed: ${error.message}`);
      return false;
    }
    
    logSuccess('Database connection successful');
    return true;
  } catch (error) {
    logError(`Connection test failed: ${error.message}`);
    return false;
  }
}

// Test table structure
async function testTableStructure(supabase) {
  logInfo('Testing companies table structure...');
  
  try {
    // Try to select with all expected columns
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, cnpj, tax_regime, taxregime, status, address, created_at, updated_at')
      .limit(1);
    
    if (error) {
      logError(`Table structure test failed: ${error.message}`);
      logWarning('This might indicate missing columns or incorrect table structure');
      return false;
    }
    
    logSuccess('Table structure appears correct');
    return true;
  } catch (error) {
    logError(`Table structure test failed: ${error.message}`);
    return false;
  }
}

// Test RLS policies
async function testRLSPolicies(supabase) {
  logInfo('Testing Row Level Security policies...');
  
  try {
    // Test SELECT permission
    const { data: selectData, error: selectError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);
    
    if (selectError) {
      logError(`SELECT permission denied: ${selectError.message}`);
    } else {
      logSuccess('SELECT permission granted');
    }
    
    // Test INSERT permission with minimal data
    const testCompany = {
      name: 'Test Company DELETE ME',
      cnpj: '00.000.000/0001-00',
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
      logError(`INSERT permission denied: ${insertError.message}`);
      logError(`Error code: ${insertError.code}`);
      logError(`Error details: ${JSON.stringify(insertError.details, null, 2)}`);
      
      // Check for specific RLS error
      if (insertError.message.includes('new row violates row-level security policy')) {
        logWarning('This is a Row Level Security (RLS) policy violation');
        logWarning('The user does not have permission to insert into the companies table');
        logWarning('You need to either:');
        logWarning('1. Disable RLS on the companies table, OR');
        logWarning('2. Create appropriate RLS policies that allow authenticated users to insert');
      }
      
      return false;
    } else {
      logSuccess('INSERT permission granted');
      
      // Clean up test data
      if (insertData?.id) {
        await supabase.from('companies').delete().eq('id', insertData.id);
        logInfo('Test data cleaned up');
      }
      
      return true;
    }
  } catch (error) {
    logError(`RLS policy test failed: ${error.message}`);
    return false;
  }
}

// Test authentication status
async function testAuthStatus(supabase) {
  logInfo('Testing authentication status...');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logError(`Auth status check failed: ${error.message}`);
      return false;
    }
    
    if (session) {
      logSuccess(`User authenticated: ${session.user.email}`);
      logInfo(`User ID: ${session.user.id}`);
      logInfo(`User role: ${session.user.role || 'default'}`);
      return true;
    } else {
      logWarning('No active session - user is not authenticated');
      logWarning('RLS policies might require authentication');
      return false;
    }
  } catch (error) {
    logError(`Auth status check failed: ${error.message}`);
    return false;
  }
}

// Generate RLS policy suggestions
function generateRLSSuggestions() {
  logInfo('Suggested RLS policies for companies table:');
  
  console.log(`
${colors.blue}-- Option 1: Allow all authenticated users to manage companies${colors.reset}
${colors.yellow}-- Enable RLS${colors.reset}
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

${colors.yellow}-- Allow authenticated users to select companies${colors.reset}
CREATE POLICY "Allow authenticated users to view companies" ON companies
    FOR SELECT USING (auth.role() = 'authenticated');

${colors.yellow}-- Allow authenticated users to insert companies${colors.reset}
CREATE POLICY "Allow authenticated users to create companies" ON companies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

${colors.yellow}-- Allow authenticated users to update companies${colors.reset}
CREATE POLICY "Allow authenticated users to update companies" ON companies
    FOR UPDATE USING (auth.role() = 'authenticated');

${colors.yellow}-- Allow authenticated users to delete companies${colors.reset}
CREATE POLICY "Allow authenticated users to delete companies" ON companies
    FOR DELETE USING (auth.role() = 'authenticated');

${colors.blue}-- Option 2: Disable RLS entirely (less secure but simpler)${colors.reset}
${colors.red}ALTER TABLE companies DISABLE ROW LEVEL SECURITY;${colors.reset}
`);
}

// Main diagnostic function
async function runCompanyCreationDiagnostic() {
  log(`${colors.bold}🔍 Company Creation Diagnostic${colors.reset}`);
  log('Diagnosing issues with company creation in Supabase\n');
  
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
  
  // Test 1: Database connection
  if (!(await testConnection(supabase))) {
    allTestsPassed = false;
  }
  console.log('');
  
  // Test 2: Authentication status
  const isAuthenticated = await testAuthStatus(supabase);
  if (!isAuthenticated) {
    logWarning('User is not authenticated - this might be the root cause');
  }
  console.log('');
  
  // Test 3: Table structure
  if (!(await testTableStructure(supabase))) {
    allTestsPassed = false;
  }
  console.log('');
  
  // Test 4: RLS policies
  if (!(await testRLSPolicies(supabase))) {
    allTestsPassed = false;
    console.log('');
    generateRLSSuggestions();
  }
  
  console.log('');
  
  // Summary
  if (allTestsPassed) {
    logSuccess('🎉 All tests passed! Company creation should work.');
  } else {
    logError('❌ Some tests failed. Please check the issues above.');
    
    if (!isAuthenticated) {
      logWarning('💡 Most likely cause: User needs to be logged in to create companies');
      logWarning('💡 Make sure the user is authenticated before trying to create a company');
    }
    
    logWarning('💡 If RLS policies are the issue, run the suggested SQL commands in your Supabase dashboard');
  }
}

// Run the diagnostic
if (require.main === module) {
  runCompanyCreationDiagnostic().catch(error => {
    logError(`Diagnostic failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runCompanyCreationDiagnostic,
  testConnection,
  testTableStructure,
  testRLSPolicies,
  testAuthStatus
};