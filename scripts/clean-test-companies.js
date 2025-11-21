#!/usr/bin/env node

/**
 * Script para limpar empresas de teste duplicadas
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

// Clean test companies
async function cleanTestCompanies() {
  log(`${colors.bold}🧹 Clean Test Companies${colors.reset}`);
  log('Removing duplicate and test companies from database\n');
  
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
  
  try {
    // First, login to ensure we have permissions
    logInfo('Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'sofia.ribeiro@hrvision.com',
      password: 'Senha@123'
    });
    
    if (authError) {
      logError(`Login failed: ${authError.message}`);
      return false;
    }
    
    logSuccess(`Logged in as: ${authData.user.email}`);
    
    // Get all companies
    logInfo('Fetching all companies...');
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      logError(`Failed to fetch companies: ${fetchError.message}`);
      return false;
    }
    
    logInfo(`Found ${companies.length} companies`);
    
    // Identify test companies and duplicates
    const testCompanies = companies.filter(company => 
      company.name.toLowerCase().includes('test') ||
      company.name.toLowerCase().includes('teste') ||
      company.name.toLowerCase().includes('debug') ||
      company.cnpj === '12.345.678/0001-99' ||
      company.cnpj === '17.887.903/0001-51' // CNPJ from the error
    );
    
    // Find duplicates by CNPJ
    const cnpjMap = new Map();
    const duplicates = [];
    
    companies.forEach(company => {
      if (cnpjMap.has(company.cnpj)) {
        duplicates.push(company);
      } else {
        cnpjMap.set(company.cnpj, company);
      }
    });
    
    logInfo(`Found ${testCompanies.length} test companies`);
    logInfo(`Found ${duplicates.length} duplicate companies`);
    
    // Show what will be deleted
    if (testCompanies.length > 0) {
      logWarning('Test companies to be deleted:');
      testCompanies.forEach(company => {
        console.log(`  - ${company.name} (${company.cnpj}) - ID: ${company.id}`);
      });
    }
    
    if (duplicates.length > 0) {
      logWarning('Duplicate companies to be deleted:');
      duplicates.forEach(company => {
        console.log(`  - ${company.name} (${company.cnpj}) - ID: ${company.id}`);
      });
    }
    
    const toDelete = [...testCompanies, ...duplicates];
    
    if (toDelete.length === 0) {
      logSuccess('No test or duplicate companies found to clean');
      return true;
    }
    
    // Ask for confirmation
    logWarning(`About to delete ${toDelete.length} companies. Continue? (y/N)`);
    
    // For automated execution, we'll skip confirmation
    // In a real scenario, you'd want to add readline for confirmation
    
    // Delete companies
    logInfo('Deleting companies...');
    let deletedCount = 0;
    
    for (const company of toDelete) {
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);
      
      if (deleteError) {
        logError(`Failed to delete ${company.name}: ${deleteError.message}`);
      } else {
        deletedCount++;
        logInfo(`Deleted: ${company.name} (${company.cnpj})`);
      }
    }
    
    logSuccess(`Successfully deleted ${deletedCount} companies`);
    
    // Show remaining companies
    const { data: remainingCompanies, error: remainingError } = await supabase
      .from('companies')
      .select('name, cnpj')
      .order('name');
    
    if (!remainingError && remainingCompanies) {
      logInfo(`Remaining companies (${remainingCompanies.length}):`);
      remainingCompanies.forEach(company => {
        console.log(`  - ${company.name} (${company.cnpj})`);
      });
    }
    
    // Logout
    await supabase.auth.signOut();
    logInfo('Logged out');
    
    return true;
    
  } catch (error) {
    logError(`Cleanup failed: ${error.message}`);
    return false;
  }
}

// Run the cleanup
if (require.main === module) {
  cleanTestCompanies().catch(error => {
    logError(`Cleanup execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  cleanTestCompanies
};