# Environment Configuration Validator

This document describes the environment configuration validator that ensures proper Supabase configuration.

## Overview

The environment validator checks that:
- Required environment variables are present
- Supabase URL follows the correct format (`https://[project-ref].supabase.co`)
- Supabase anon key is a valid JWT token
- URL and token project references match

## Usage

### Automatic Validation

The validator runs automatically when the application starts:

1. **Client-side**: Validation runs in the `SupabaseProvider` component
2. **Server-side**: Validation runs in the middleware for each request

### Manual Validation

You can also validate configuration manually:

```typescript
import { validateEnvironmentConfig, assertValidEnvironmentConfig } from '@/lib/env-validator';

// Get validation result without throwing
const result = validateEnvironmentConfig();
if (!result.isValid) {
  console.error('Configuration errors:', result.errors);
}

// Assert valid configuration (throws on error)
try {
  assertValidEnvironmentConfig();
  console.log('Configuration is valid');
} catch (error) {
  console.error('Configuration error:', error.message);
}
```

## Environment Variables

### Required Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Correct Format

```bash
# ✅ Correct format
NEXT_PUBLIC_SUPABASE_URL=https://fedjwaqzijymhafbdejb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ❌ Incorrect format (Vercel URL)
NEXT_PUBLIC_SUPABASE_URL=https://sistema-rh-jo.vercel.app/dashboard
```

## Error Messages

### Common Errors

1. **Invalid URL Format**
   ```
   Invalid Supabase URL format: "https://example.com"
   Expected format: https://[project-ref].supabase.co
   ```

2. **Vercel URL Detected**
   ```
   Supabase URL appears to be a Vercel deployment URL.
   Use your Supabase project URL instead.
   ```

3. **Missing Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL is required
   NEXT_PUBLIC_SUPABASE_ANON_KEY is required
   ```

4. **Invalid JWT Token**
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY does not appear to be a valid JWT token
   ```

### Warnings

1. **Project Reference Mismatch**
   ```
   Project reference mismatch: URL contains "project-a" but token contains "project-b"
   ```

## Integration Points

The validator is integrated at these points:

1. **SupabaseProvider** (`src/components/auth/supabase-provider.tsx`)
   - Runs validation on client-side startup
   - Logs errors but doesn't block rendering

2. **Middleware** (`src/middleware.ts`)
   - Runs validation on each server request
   - Returns 500 error if configuration is invalid

3. **Supabase Clients** (`src/lib/supabase.ts`, `src/lib/supabase-client.ts`)
   - Use validated configuration when creating clients
   - Throw errors if configuration is invalid

## Troubleshooting

### Development Issues

If you see validation errors during development:

1. Check your `.env.local` file
2. Ensure `NEXT_PUBLIC_SUPABASE_URL` uses the correct Supabase format
3. Verify your anon key is copied correctly from Supabase dashboard
4. Restart the development server after changing environment variables

### Production Issues

If validation fails in production:

1. Check your deployment environment variables
2. Ensure variables are properly set in your hosting platform
3. Verify the Supabase project is accessible from your production domain

### Getting Your Supabase Configuration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the "Project URL" and "anon public" key
5. Use these values in your environment variables