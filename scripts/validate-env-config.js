#!/usr/bin/env node

/**
 * Environment Configuration Validation Script
 * 
 * This script validates the current environment configuration
 * and provides detailed feedback about any issues.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import validation functions (we'll implement them here for the script)
function validateSupabaseUrl(url) {
  if (!url) return { isValid: false, error: 'NEXT_PUBLIC_SUPABASE_URL is required' };
  
  // Check if it's a Vercel URL
  if (url.includes('vercel.app')) {
    return { 
      isValid: false, 
      error: 'Supabase URL appears to be a Vercel deployment URL. Use your Supabase project URL instead.' 
    };
  }
  
  // Check if it follows Supabase format
  const supabaseUrlPattern = /^https:\/\/[a-z0-9]+\.supabase\.co$/;
  if (!supabaseUrlPattern.test(url)) {
    return { 
      isValid: false, 
      error: `Invalid Supabase URL format: "${url}". Expected format: https://[project-ref].supabase.co` 
    };
  }
  
  return { isValid: true };
}

function validateSupabaseAnonKey(key) {
  if (!key) return { isValid: false, error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required' };
  
  // Check if it looks like a JWT token
  const parts = key.split('.');
  if (parts.length !== 3) {
    return { 
      isValid: false, 
      error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY does not appear to be a valid JWT token' 
    };
  }
  
  return { isValid: true };
}

function validateEnvironmentForCurrentStage() {
  const errors = [];
  const warnings = [];
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Validate URL
  const urlValidation = validateSupabaseUrl(url);
  if (!urlValidation.isValid) {
    errors.push(urlValidation.error);
  }
  
  // Validate anon key
  const keyValidation = validateSupabaseAnonKey(anonKey);
  if (!keyValidation.isValid) {
    errors.push(keyValidation.error);
  }
  
  // Check for project reference mismatch
  if (url && anonKey && urlValidation.isValid && keyValidation.isValid) {
    try {
      const urlMatch = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
      if (urlMatch) {
        const urlProjectRef = urlMatch[1];
        
        // Decode JWT payload to check project reference
        const payload = JSON.parse(Buffer.from(anonKey.split('.')[1], 'base64').toString());
        if (payload.iss && payload.iss.includes('supabase.co')) {
          const tokenProjectRef = payload.iss.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
          if (tokenProjectRef && tokenProjectRef[1] !== urlProjectRef) {
            warnings.push(`Project reference mismatch: URL contains "${urlProjectRef}" but token contains "${tokenProjectRef[1]}"`);
          }
        }
      }
    } catch (e) {
      // Ignore JWT decode errors for this validation
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function validateProductionEnvironment() {
  const errors = [];
  
  // In production, we want stricter validation
  if (process.env.NODE_ENV === 'production') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check for placeholder values
    if (url && (url.includes('your-project-ref') || url.includes('localhost'))) {
      errors.push('Production environment contains placeholder Supabase URL');
    }
    
    if (anonKey && (anonKey.includes('your-supabase-anon-key') || anonKey.length < 100)) {
      errors.push('Production environment contains placeholder or invalid anon key');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function runValidation() {
  console.log('🔍 Validating environment configuration...\n');
  
  // Show current environment
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || '(not set)'}`);
  console.log(`Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '(not set)'}\n`);
  
  try {
    // Run validation for current stage
    const validation = validateEnvironmentForCurrentStage();
    
    if (validation.isValid) {
      console.log('✅ Environment configuration is valid!');
    } else {
      console.log('❌ Environment configuration has errors:');
      validation.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    
    if (validation.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      validation.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }
    
    // If in production, also run production-specific validation
    if (process.env.NODE_ENV === 'production') {
      console.log('\n🏭 Running additional production checks...');
      const prodValidation = validateProductionEnvironment();
      
      if (!prodValidation.isValid) {
        console.log('❌ Production-specific validation failed:');
        prodValidation.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      } else {
        console.log('✅ Production configuration is valid!');
      }
    }
    
  } catch (error) {
    console.error('💥 Validation failed with error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runValidation();
}

module.exports = { runValidation };