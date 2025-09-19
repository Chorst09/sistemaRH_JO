# Environment Configuration Guide

This guide explains how to properly configure environment variables for the application to prevent authentication errors and ensure proper functionality.

## Overview

The application uses Supabase for authentication and database operations. Proper configuration of environment variables is critical for the application to function correctly. Incorrect configuration is the most common cause of authentication failures.

## Required Environment Variables

### Supabase Configuration

The application requires the following Supabase environment variables:

```bash
# Your Supabase project URL (REQUIRED)
# Format: https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Your Supabase anon/public key (REQUIRED)
# This is safe to expose in the browser
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### Critical Requirements

- ✅ **URL Format**: Must be `https://[project-ref].supabase.co`
- ✅ **Anon Key**: Must be a valid JWT token from the same Supabase project
- ✅ **Project Match**: URL and anon key must be from the same Supabase project
- ❌ **Never use**: Vercel URLs, localhost URLs, or dashboard URLs

## How to Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** > **API**
4. Copy the following values:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Environment Files

### Development (.env.local)

Create a `.env.local` file in the project root with your actual Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

### Production

For production deployments, set these environment variables in your hosting platform:

- **Vercel**: Project Settings > Environment Variables
- **Netlify**: Site Settings > Environment Variables
- **Railway**: Project Settings > Variables

## Common Issues and Solutions

### ❌ Error: Invalid Supabase URL format

**Problem**: The URL doesn't follow the correct Supabase format.

**Solution**: Make sure your URL follows this pattern:
```
https://[project-ref].supabase.co
```

**Common mistakes**:
- Using Vercel deployment URLs (e.g., `https://my-app.vercel.app`)
- Including paths (e.g., `https://project.supabase.co/dashboard`)
- Missing `https://` protocol

### ❌ Error: Supabase URL appears to be a Vercel deployment URL

**Problem**: You're using your Vercel app URL instead of your Supabase project URL.

**Solution**: Replace the Vercel URL with your actual Supabase project URL from the Supabase dashboard.

### ❌ Error: Project reference mismatch

**Problem**: The project reference in your URL doesn't match the one in your anon key.

**Solution**: Make sure both the URL and anon key are from the same Supabase project.

## Validation

The application includes built-in validation that runs at startup. You can also manually validate your configuration:

```bash
# Validate current environment
npm run validate-env

# Or run the validation script directly
node scripts/validate-env-config.js
```

## Security Notes

- ✅ **Safe to expose**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to expose in the browser
- ❌ **Keep secret**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- 🔒 **Production**: Use environment variables, never hardcode credentials

## Environment-Specific Validation

The application uses different validation rules based on the environment:

### Development
- Allows placeholder values with warnings
- More lenient validation for testing

### Production
- Strict validation of all credentials
- Rejects placeholder values
- Additional security checks

## Quick Validation

Before starting the application, validate your configuration:

```bash
# Run the built-in validator
npm run validate-env

# Or run the validation script directly
node scripts/validate-env-config.js
```

The validator will check:
- Environment variable presence
- URL format correctness
- JWT token validity
- Project reference matching

## Troubleshooting

### Quick Fixes for Common Issues

1. **400 Bad Request during login**:
   - Check if `NEXT_PUBLIC_SUPABASE_URL` uses correct format
   - Verify you're not using a Vercel deployment URL
   - Run `npm run validate-env` to check configuration

2. **Authentication not working**:
   - Ensure anon key is from the same project as the URL
   - Check that your Supabase project is active
   - Verify API keys haven't expired

3. **Environment variables not loading**:
   - Restart development server after changing `.env.local`
   - Check file permissions on environment files
   - Ensure variables don't have trailing spaces

### Detailed Troubleshooting

For comprehensive troubleshooting, see: [Authentication Troubleshooting Guide](./authentication-troubleshooting.md)

### Getting Help

If you're still having issues:

1. Run the validation script and share the output
2. Check the browser console for error messages
3. Verify your Supabase project status in the dashboard
4. Review the [Authentication Troubleshooting Guide](./authentication-troubleshooting.md)

## Example Valid Configuration

```bash
# ✅ Correct format
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ❌ Incorrect formats
NEXT_PUBLIC_SUPABASE_URL=https://my-app.vercel.app/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/project/abc
NEXT_PUBLIC_SUPABASE_URL=localhost:3000
```