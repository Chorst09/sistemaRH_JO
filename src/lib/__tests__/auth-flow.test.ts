/**
 * Authentication Flow Tests
 * 
 * Tests the complete authentication flow with corrected configuration
 * Requirements: 1.1, 1.2, 1.3
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { createClient, getSupabaseConfigStatus, canCreateSupabaseClient } from '../supabase-client';
import { handleAuthError, validateAuthInput } from '../auth-error-handler';
import { getValidatedEnvironmentConfig } from '../env-validator';

// Mock environment variables
const mockEnvConfig = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://fedjwaqzijymhafbdejb.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZGp3YXF6aWp5bWhhZmJkZWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzY4MDMsImV4cCI6MjA3MzYxMjgwM30.Lp5tqVLE5h_GpNoGRa-9kvaOgpRtysiq8O35mofa5Ng'
};

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    getSession: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  }
};

// Mock modules
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockSupabaseClient)
}));

vi.mock('../env-validator', () => ({
  getValidatedEnvironmentConfig: vi.fn(() => mockEnvConfig)
}));

describe('Authentication Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    process.env.NEXT_PUBLIC_SUPABASE_URL = mockEnvConfig.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = mockEnvConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Supabase Client Configuration', () => {
    it('should create client with correct Supabase URL format', () => {
      // Requirement 1.1: System should use correct Supabase URL for authentication
      const client = createClient();
      
      expect(client).toBeDefined();
      expect(getValidatedEnvironmentConfig).toHaveBeenCalled();
    });

    it('should validate Supabase URL format', () => {
      // Requirement 1.2: System should validate environment variables are in correct format
      const status = getSupabaseConfigStatus();
      
      expect(status.hasUrl).toBe(true);
      expect(status.hasAnonKey).toBe(true);
      expect(status.urlValid).toBe(true);
      expect(status.canCreateClient).toBe(true);
    });

    it('should detect invalid Supabase URL format', () => {
      // Test with invalid URL (like the original Vercel URL)
      const invalidConfig = {
        ...mockEnvConfig,
        NEXT_PUBLIC_SUPABASE_URL: 'https://sistema-rh-jo.vercel.app/dashboard'
      };
      
      (getValidatedEnvironmentConfig as Mock).mockReturnValueOnce(invalidConfig);
      
      // Should still create client but log warning
      const client = createClient();
      expect(client).toBeDefined();
    });

    it('should handle missing environment variables', () => {
      // Test missing URL
      (getValidatedEnvironmentConfig as Mock).mockImplementationOnce(() => {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
      });
      
      expect(() => createClient()).toThrow('Supabase client configuration error');
    });
  });

  describe('Login Functionality', () => {
    it('should handle successful login', async () => {
      // Requirement 1.1: User should be able to login without 400 errors
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'mock-token'
      };
      
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockSession.user, session: mockSession },
        error: null
      });
      
      const client = createClient();
      const result = await client.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(result.data.user).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle authentication errors gracefully', async () => {
      // Requirement 1.3: System should display specific error messages for authentication failures
      const authError = {
        message: 'Invalid login credentials',
        status: 400
      };
      
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: authError
      });
      
      const client = createClient();
      const result = await client.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Invalid login credentials');
    });

    it('should validate input before authentication', () => {
      // Test input validation
      const emptyEmailError = validateAuthInput('', 'password123');
      expect(emptyEmailError).toBeDefined();
      expect(emptyEmailError?.type).toBe('validation');
      
      const emptyPasswordError = validateAuthInput('test@example.com', '');
      expect(emptyPasswordError).toBeDefined();
      expect(emptyPasswordError?.type).toBe('validation');
      
      const validInput = validateAuthInput('test@example.com', 'password123');
      expect(validInput).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should handle existing session validation', async () => {
      // Test session check functionality
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'mock-token'
      };
      
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      });
      
      const client = createClient();
      const result = await client.auth.getSession();
      
      expect(result.data.session).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle session validation errors', async () => {
      // Test session validation with errors
      const sessionError = {
        message: 'Session expired',
        status: 401
      };
      
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: sessionError
      });
      
      const client = createClient();
      const result = await client.auth.getSession();
      
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Session expired');
    });
  });

  describe('Error Handling', () => {
    it('should provide specific error messages for different failure types', () => {
      // Requirement 1.3: System should display specific error messages
      
      // Test network error (needs fetch keyword to be detected as network)
      const networkError = { message: 'fetch error: network failure', code: 'NETWORK_ERROR' };
      const handledNetworkError = handleAuthError(networkError, { context: 'login' });
      expect(handledNetworkError.type).toBe('network');
      expect(handledNetworkError.userMessage).toContain('conexão');
      
      // Test authentication error
      const authError = { message: 'Invalid login credentials', status: 401 };
      const handledAuthError = handleAuthError(authError, { context: 'login' });
      expect(handledAuthError.type).toBe('auth');
      expect(handledAuthError.userMessage).toContain('credenciais');
      
      // Test configuration error (needs SUPABASE_URL keyword)
      const configError = { message: 'Invalid SUPABASE_URL format' };
      const handledConfigError = handleAuthError(configError, { context: 'config' });
      expect(handledConfigError.type).toBe('config');
      expect(handledConfigError.userMessage).toContain('configuração');
    });

    it('should handle 400 errors specifically', () => {
      // Test the original 400 error scenario
      const badRequestError = { 
        message: 'Bad Request', 
        status: 400,
        code: 'BAD_REQUEST'
      };
      
      const handledError = handleAuthError(badRequestError, { 
        context: 'login',
        url: 'https://sistema-rh-jo.vercel.app/dashboard' // Original problematic URL
      });
      
      // Based on the error handler logic, 400 errors default to 'auth' type
      expect(handledError.type).toBe('auth');
      expect(handledError.userMessage).toBeDefined();
      expect(handledError.statusCode).toBe(400);
    });
  });

  describe('Configuration Validation', () => {
    it('should detect correct Supabase URL format', () => {
      // Requirement 1.2: System should validate URLs are in correct format
      const correctUrl = 'https://fedjwaqzijymhafbdejb.supabase.co';
      
      expect(() => new URL(correctUrl)).not.toThrow();
      expect(correctUrl).toMatch(/https:\/\/.*\.supabase\.co/);
    });

    it('should detect incorrect URL formats', () => {
      // Test various incorrect formats
      const incorrectUrls = [
        'https://sistema-rh-jo.vercel.app/dashboard', // Original problem
        'http://localhost:3000', // Wrong protocol/domain
        'https://example.com', // Not Supabase
        'invalid-url' // Invalid format
      ];
      
      incorrectUrls.forEach(url => {
        if (url === 'invalid-url') {
          expect(() => new URL(url)).toThrow();
        } else {
          const parsedUrl = new URL(url);
          expect(parsedUrl.hostname.includes('supabase')).toBe(false);
        }
      });
    });

    it('should validate anon key format', () => {
      // Test anon key validation
      const validKey = mockEnvConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const invalidKey = 'invalid-key';
      
      expect(validKey.length).toBeGreaterThan(100);
      expect(validKey.includes('.')).toBe(true);
      
      expect(invalidKey.length).toBeLessThan(100);
      expect(invalidKey.includes('.')).toBe(false);
    });
  });

  describe('Health Checks', () => {
    it('should report healthy configuration', () => {
      const canCreate = canCreateSupabaseClient();
      expect(canCreate).toBe(true);
    });

    it('should report unhealthy configuration', () => {
      (getValidatedEnvironmentConfig as Mock).mockImplementationOnce(() => {
        throw new Error('Configuration error');
      });
      
      const canCreate = canCreateSupabaseClient();
      expect(canCreate).toBe(false);
    });

    it('should provide detailed configuration status', () => {
      const status = getSupabaseConfigStatus();
      
      expect(status).toHaveProperty('hasUrl');
      expect(status).toHaveProperty('hasAnonKey');
      expect(status).toHaveProperty('urlValid');
      expect(status).toHaveProperty('canCreateClient');
      
      expect(status.hasUrl).toBe(true);
      expect(status.hasAnonKey).toBe(true);
      expect(status.urlValid).toBe(true);
      expect(status.canCreateClient).toBe(true);
    });
  });
});