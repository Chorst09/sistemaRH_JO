/**
 * Simple test script for environment validator
 * Run with: node scripts/test-env-validator.js
 */

// Mock environment variables for testing
const originalEnv = process.env;

function testValidation(testName, envVars, expectedValid) {
  console.log(`\n🧪 Testing: ${testName}`);
  
  // Set test environment variables
  process.env = { ...originalEnv, ...envVars };
  
  try {
    // Clear require cache to get fresh module
    delete require.cache[require.resolve('../src/lib/env-validator.ts')];
    
    const { validateEnvironmentConfig } = require('../src/lib/env-validator.ts');
    const result = validateEnvironmentConfig();
    
    console.log(`   Valid: ${result.isValid}`);
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
    if (result.warnings.length > 0) {
      console.log(`   Warnings: ${result.warnings.join(', ')}`);
    }
    
    const passed = result.isValid === expectedValid;
    console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    return passed;
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log(`   ${!expectedValid ? '✅ PASS (expected error)' : '❌ FAIL'}`);
    return !expectedValid;
  } finally {
    // Restore original environment
    process.env = originalEnv;
  }
}

console.log('🔍 Testing Environment Validator\n');

let allPassed = true;

// Test 1: Valid configuration
allPassed &= testValidation(
  'Valid Supabase configuration',
  {
    NEXT_PUBLIC_SUPABASE_URL: 'https://fedjwaqzijymhafbdejb.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZGp3YXF6aWp5bWhhZmJkZWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzY4MDMsImV4cCI6MjA3MzYxMjgwM30.Lp5tqVLE5h_GpNoGRa-9kvaOgpRtysiq8O35mofa5Ng'
  },
  true
);

// Test 2: Invalid Vercel URL
allPassed &= testValidation(
  'Invalid Vercel URL',
  {
    NEXT_PUBLIC_SUPABASE_URL: 'https://sistema-rh-jo.vercel.app/dashboard',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZGp3YXF6aWp5bWhhZmJkZWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzY4MDMsImV4cCI6MjA3MzYxMjgwM30.Lp5tqVLE5h_GpNoGRa-9kvaOgpRtysiq8O35mofa5Ng'
  },
  false
);

// Test 3: Missing URL
allPassed &= testValidation(
  'Missing URL',
  {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZGp3YXF6aWp5bWhhZmJkZWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzY4MDMsImV4cCI6MjA3MzYxMjgwM30.Lp5tqVLE5h_GpNoGRa-9kvaOgpRtysiq8O35mofa5Ng'
  },
  false
);

// Test 4: Missing anon key
allPassed &= testValidation(
  'Missing anon key',
  {
    NEXT_PUBLIC_SUPABASE_URL: 'https://fedjwaqzijymhafbdejb.supabase.co'
  },
  false
);

console.log(`\n${allPassed ? '🎉 All tests passed!' : '❌ Some tests failed'}`);
process.exit(allPassed ? 0 : 1);