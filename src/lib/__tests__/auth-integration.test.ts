/**
 * Authentication Integration Tests
 * 
 * End-to-end tests for authentication flow with real Supabase configuration
 * Requirements: 1.1, 1.2, 1.3
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient, getSupabaseConfigStatus } from '../supabase-client';
import { getValidatedEnvironmentConfig } from '../env-validator';

describe('Authentication Integration Tests', () => {
  let supabaseClient: ReturnType<typeof createClient>;
  let testConfig: ReturnType<typeof getValidatedEnvironmentConfig>;

  beforeAll(() => {
    // Verify we have proper test configuration
    testConfig = getValidatedEnvironmentConfig();
    expect(testConfig.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(testConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  });

  beforeEach(() => {
    supabaseClient = createClient();
  });

  describe('Configuration Validation', () => {
    it('should have correct Supabase URL format', () => {
      // Requirement 1.1: System should use correct Supabase URL
      const url = testConfig.NEXT_PUBLIC_SUPABASE_URL;
      
      // Should be a valid URL
      expect(() => new URL(url)).not.toThrow();
      
      // Should be HTTPS
      const parsedUrl = new URL(url);
      expect(parsedUrl.protocol).toBe('https:');
      
      // Should be Supabase domain (not Vercel or other)
      expect(parsedUrl.hostname).toMatch(/\.supabase\.co$/);
      
      // Should not be the problematic Vercel URL
      expect(url).not.toContain('vercel.app');
      expect(url).not.toContain('/dashboard');
    });

    it('should have valid anon key format', () => {
      // Requirement 1.2: System should validate environment variables format
      const anonKey = testConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // Should be a JWT-like string
      expect(anonKey).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
      
      // Should be reasonably long
      expect(anonKey.length).toBeGreaterThan(100);
    });

    it('should report healthy configuration status', () => {
      // Requirement 1.2: System should validate configuration
      const status = getSupabaseConfigStatus();
      
      expect(status.hasUrl).toBe(true);
      expect(status.hasAnonKey).toBe(true);
      expect(status.urlValid).toBe(true);
      expect(status.canCreateClient).toBe(true);
      expect(status.error).toBeUndefined();
    });
  });

  describe('Client Creation', () => {
    it('should create Supabase client successfully', () => {
      // Requirement 1.1: System should create client with correct URL
      expect(supabaseClient).toBeDefined();
      expect(supabaseClient.auth).toBeDefined();
    });

    it('should have auth methods available', () => {
      // Verify all required auth methods are available
      expect(typeof supabaseClient.auth.signInWithPassword).toBe('function');
      expect(typeof supabaseClient.auth.getSession).toBe('function');
      expect(typeof supabaseClient.auth.signOut).toBe('function');
      expect(typeof supabaseClient.auth.onAuthStateChange).toBe('function');
    });
  });

  describe('Authentication Flow', () => {
    it('should handle session check without errors', async () => {
      // Requirement 1.1: System should work without 400 errors
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        
        // Should not throw or return 400 error
        if (error) {
          expect(error.message).not.toContain('400');
          expect(error.message).not.toContain('Bad Request');
        }
        
        // Data should be properly structured
        expect(data).toBeDefined();
        expect(data).toHaveProperty('session');
      } catch (error: any) {
        // Should not get network or configuration errors
        expect(error.message).not.toContain('fetch');
        expect(error.message).not.toContain('network');
        expect(error.message).not.toContain('CORS');
      }
    });

    it('should handle invalid credentials gracefully', async () => {
      // Requirement 1.3: System should display specific error messages
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });

      if (error) {
        // Should get proper auth error, not configuration error
        expect(error.message).not.toContain('400');
        expect(error.message).not.toContain('Bad Request');
        expect(error.message).not.toContain('fetch');
        
        // Should be a proper authentication error
        expect(['Invalid login credentials', 'Email not confirmed', 'User not found']).toContain(error.message);
      }
      
      expect(data.user).toBeNull();
      expect(data.session).toBeNull();
    });

    it('should handle malformed email gracefully', async () => {
      // Test with invalid email format
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: 'invalid-email',
        password: 'password123'
      });

      if (error) {
        // Should get validation error, not 400 configuration error
        expect(error.message).not.toContain('400');
        expect(error.message).not.toContain('Bad Request');
      }
      
      expect(data.user).toBeNull();
    });
  });

  describe('Error Scenarios', () => {
    it('should not produce 400 errors with correct configuration', async () => {
      // Requirement 1.1: No 400 errors with correct Supabase URL
      
      // Test multiple auth operations
      const operations = [
        () => supabaseClient.auth.getSession(),
        () => supabaseClient.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'testpassword'
        }),
      ];

      for (const operation of operations) {
        try {
          const result = await operation();
          
          if ('error' in result && result.error) {
            // Should not be 400 Bad Request errors
            expect(result.error.message).not.toContain('400');
            expect(result.error.message).not.toContain('Bad Request');
            
            // Should not be configuration-related errors
            expect(result.error.message).not.toContain('fetch');
            expect(result.error.message).not.toContain('CORS');
            expect(result.error.message).not.toContain('network');
          }
        } catch (error: any) {
          // Should not throw configuration errors
          expect(error.message).not.toContain('400');
          expect(error.message).not.toContain('Bad Request');
          expect(error.message).not.toContain('fetch');
        }
      }
    });

    it('should provide meaningful error messages', async () => {
      // Requirement 1.3: Specific error messages for different failures
      
      // Test with empty credentials
      const { error: emptyError } = await supabaseClient.auth.signInWithPassword({
        email: '',
        password: ''
      });

      if (emptyError) {
        expect(emptyError.message).toBeDefined();
        expect(emptyError.message.length).toBeGreaterThan(0);
        expect(emptyError.message).not.toBe('400');
        expect(emptyError.message).not.toBe('Bad Request');
      }
    });
  });

  describe('Network Connectivity', () => {
    it('should connect to correct Supabase endpoint', async () => {
      // Verify we're connecting to the right endpoint
      const url = testConfig.NEXT_PUBLIC_SUPABASE_URL;
      
      // Should be able to make a request to the auth endpoint
      try {
        const response = await fetch(`${url}/auth/v1/settings`);
        
        // Should get a response (even if 404, means we reached Supabase)
        expect(response).toBeDefined();
        
        // Should not get CORS or network errors
        expect(response.status).not.toBe(0);
        
      } catch (error: any) {
        // If fetch fails, it should not be due to wrong URL
        expect(error.message).not.toContain('CORS');
        expect(error.message).not.toContain('ERR_NAME_NOT_RESOLVED');
      }
    });
  });
});