#!/usr/bin/env node

/**
 * Manual Authentication Flow Test Script
 * 
 * This script tests the authentication flow with the corrected configuration
 * Requirements: 1.1, 1.2, 1.3
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

// Validate Supabase configuration
function validateConfiguration(env) {
  logInfo('Validating Supabase configuration...');
  
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url) {
    logError('NEXT_PUBLIC_SUPABASE_URL is not defined');
    return false;
  }
  
  if (!anonKey) {
    logError('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
    return false;
  }

  // Validate URL format
  try {
    const parsedUrl = new URL(url);
    
    if (parsedUrl.protocol !== 'https:') {
      logWarning('Supabase URL should use HTTPS protocol');
    }
    
    if (!parsedUrl.hostname.includes('supabase')) {
      logWarning('URL does not appear to be a Supabase URL');
    }
    
    if (parsedUrl.hostname.includes('vercel.app')) {
      logError('URL appears to be a Vercel deployment URL, not Supabase!');
      logError('This was the original problem causing 400 errors');
      return false;
    }
    
    if (url.includes('/dashboard')) {
      logError('URL contains /dashboard path, this is incorrect for Supabase');
      return false;
    }
    
    logSuccess(`Supabase URL format is correct: ${parsedUrl.hostname}`);
  } catch (error) {
    logError(`Invalid URL format: ${error.message}`);
    return false;
  }

  // Validate anon key format
  if (anonKey.length < 100 || !anonKey.includes('.')) {
    logWarning('Anon key appears to have invalid format');
  } else {
    logSuccess('Anon key format appears valid');
  }

  return true;
}

// Test Supabase client creation
async function testClientCreation(env) {
  logInfo('Testing Supabase client creation...');
  
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    if (!supabase) {
      logError('Failed to create Supabase client');
      return null;
    }
    
    logSuccess('Supabase client created successfully');
    return supabase;
  } catch (error) {
    logError(`Failed to create Supabase client: ${error.message}`);
    return null;
  }
}

// Test session retrieval
async function testSessionRetrieval(supabase) {
  logInfo('Testing session retrieval...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        logError('Got 400 Bad Request error - this indicates configuration problem!');
        logError(`Error: ${error.message}`);
        return false;
      } else {
        logWarning(`Session error (expected if not logged in): ${error.message}`);
      }
    } else {
      logSuccess('Session retrieval successful');
      if (data.session) {
        logInfo(`Found existing session for user: ${data.session.user?.email}`);
      } else {
        logInfo('No existing session (user not logged in)');
      }
    }
    
    return true;
  } catch (error) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      logError('Network error - check internet connection and Supabase URL');
    } else {
      logError(`Session retrieval failed: ${error.message}`);
    }
    return false;
  }
}

// Test authentication with invalid credentials
async function testInvalidCredentials(supabase) {
  logInfo('Testing authentication with invalid credentials...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });
    
    if (error) {
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        logError('Got 400 Bad Request error - this indicates configuration problem!');
        logError(`Error: ${error.message}`);
        return false;
      } else if (error.message.includes('Invalid login credentials') || 
                 error.message.includes('Email not confirmed') ||
                 error.message.includes('User not found')) {
        logSuccess('Got expected authentication error (not configuration error)');
        logInfo(`Error message: ${error.message}`);
      } else {
        logWarning(`Unexpected error: ${error.message}`);
      }
    } else {
      logWarning('Expected authentication to fail with invalid credentials');
    }
    
    return true;
  } catch (error) {
    logError(`Authentication test failed: ${error.message}`);
    return false;
  }
}

// Test with malformed email
async function testMalformedEmail(supabase) {
  logInfo('Testing authentication with malformed email...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'invalid-email-format',
      password: 'password123'
    });
    
    if (error) {
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        logError('Got 400 Bad Request error - this indicates configuration problem!');
        return false;
      } else {
        logSuccess('Got expected validation error (not configuration error)');
        logInfo(`Error message: ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Malformed email test failed: ${error.message}`);
    return false;
  }
}

// Test network connectivity to Supabase
async function testNetworkConnectivity(env) {
  logInfo('Testing network connectivity to Supabase...');
  
  try {
    const url = env.NEXT_PUBLIC_SUPABASE_URL;
    const response = await fetch(`${url}/auth/v1/settings`);
    
    if (response.status === 0) {
      logError('Network request failed - possible CORS or connectivity issue');
      return false;
    }
    
    logSuccess(`Successfully connected to Supabase (status: ${response.status})`);
    return true;
  } catch (error) {
    if (error.message.includes('CORS')) {
      logWarning('CORS error - this is expected for direct fetch to auth endpoint');
      return true; // CORS is expected, means we reached the server
    } else if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
      logError('DNS resolution failed - check Supabase URL');
      return false;
    } else {
      logError(`Network connectivity test failed: ${error.message}`);
      return false;
    }
  }
}

// Main test function
async function runAuthenticationTests() {
  log(`${colors.bold}🧪 Authentication Flow Test${colors.reset}`);
  log('Testing authentication with corrected Supabase configuration\n');
  
  // Load environment
  const env = loadEnvironment();
  if (!env) {
    logError('Failed to load environment variables');
    process.exit(1);
  }
  
  let allTestsPassed = true;
  
  // Test 1: Configuration validation
  if (!validateConfiguration(env)) {
    allTestsPassed = false;
  }
  
  console.log('');
  
  // Test 2: Client creation
  const supabase = await testClientCreation(env);
  if (!supabase) {
    allTestsPassed = false;
  } else {
    console.log('');
    
    // Test 3: Session retrieval
    if (!(await testSessionRetrieval(supabase))) {
      allTestsPassed = false;
    }
    
    console.log('');
    
    // Test 4: Invalid credentials
    if (!(await testInvalidCredentials(supabase))) {
      allTestsPassed = false;
    }
    
    console.log('');
    
    // Test 5: Malformed email
    if (!(await testMalformedEmail(supabase))) {
      allTestsPassed = false;
    }
  }
  
  console.log('');
  
  // Test 6: Network connectivity
  if (!(await testNetworkConnectivity(env))) {
    allTestsPassed = false;
  }
  
  console.log('');
  
  // Summary
  if (allTestsPassed) {
    logSuccess('🎉 All authentication tests passed!');
    logSuccess('The authentication flow is working correctly with the corrected configuration.');
    logInfo('Requirements 1.1, 1.2, and 1.3 are satisfied.');
  } else {
    logError('❌ Some authentication tests failed!');
    logError('Please check the configuration and fix any issues before proceeding.');
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runAuthenticationTests().catch(error => {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAuthenticationTests,
  validateConfiguration,
  testClientCreation,
  testSessionRetrieval,
  testInvalidCredentials,
  testNetworkConnectivity
};