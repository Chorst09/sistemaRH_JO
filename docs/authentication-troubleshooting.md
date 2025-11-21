# Authentication Troubleshooting Guide

This guide helps you diagnose and fix common authentication issues in the application.

## Quick Diagnosis

If you're experiencing authentication problems, start here:

### 1. Check Your Environment Configuration

Run the built-in validator to check your configuration:

```bash
# Validate environment variables
npm run validate-env

# Or run the validation script directly
node scripts/validate-env-config.js
```

### 2. Common Error Patterns

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| `400 Bad Request` | Incorrect Supabase URL | [Fix URL Configuration](#fix-url-configuration) |
| `Invalid API key` | Wrong or expired anon key | [Fix API Key](#fix-api-key) |
| `Network Error` | Connectivity or CORS issues | [Network Issues](#network-issues) |
| `Invalid JWT` | Token format or project mismatch | [JWT Issues](#jwt-issues) |

## Environment Configuration Issues

### Fix URL Configuration

**Problem**: Using incorrect Supabase URL format

**Symptoms**:
- 400 Bad Request errors during login
- "Invalid Supabase URL format" validation errors
- Authentication requests failing

**Solution**:

1. **Check your current URL**:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   ```

2. **Correct format should be**:
   ```
   https://[project-ref].supabase.co
   ```

3. **Common mistakes to avoid**:
   ```bash
   # ❌ Wrong - Vercel deployment URL
   NEXT_PUBLIC_SUPABASE_URL=https://sistema-rh-jo.vercel.app/dashboard
   
   # ❌ Wrong - Supabase dashboard URL
   NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/project/abc
   
   # ❌ Wrong - Local development URL
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:3000
   
   # ✅ Correct - Supabase project URL
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   ```

4. **Get the correct URL**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to **Settings** > **API**
   - Copy the **Project URL**

### Fix API Key

**Problem**: Incorrect or expired Supabase anon key

**Symptoms**:
- "Invalid API key" errors
- Authentication requests being rejected
- JWT validation failures

**Solution**:

1. **Get a fresh anon key**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to **Settings** > **API**
   - Copy the **anon public** key

2. **Update your environment**:
   ```bash
   # In .env.local (development)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Restart your application** after updating environment variables

### Project Reference Mismatch

**Problem**: URL and anon key are from different Supabase projects

**Symptoms**:
- "Project reference mismatch" warnings
- Inconsistent authentication behavior
- API calls failing intermittently

**Solution**:

1. **Verify both credentials are from the same project**:
   - URL project reference: Extract from `https://[PROJECT-REF].supabase.co`
   - Token project reference: Decode JWT and check `iss` claim

2. **Get matching credentials**:
   - Ensure both URL and anon key are copied from the same Supabase project
   - Double-check you're in the correct project in the Supabase dashboard

## Authentication Flow Issues

### Login Page Errors

**Problem**: Errors occurring during the login process

**Common scenarios**:

1. **400 Bad Request on login attempt**:
   ```typescript
   // Check browser console for detailed error
   // Look for network tab in developer tools
   ```

2. **Redirect loops**:
   - Check middleware configuration
   - Verify protected route setup
   - Ensure session handling is correct

3. **Session not persisting**:
   - Check cookie settings
   - Verify domain configuration
   - Check for conflicting session storage

### Network Issues

**Problem**: Connectivity or CORS issues preventing authentication

**Symptoms**:
- Network errors in browser console
- Requests timing out
- CORS policy violations

**Diagnosis**:

1. **Check network connectivity**:
   ```bash
   # Test if Supabase is reachable
   curl -I https://your-project-ref.supabase.co
   ```

2. **Verify CORS configuration**:
   - Check Supabase project settings
   - Ensure your domain is allowed
   - Verify protocol (http vs https)

3. **Check firewall/proxy settings**:
   - Corporate firewalls may block Supabase
   - VPN settings might interfere
   - Ad blockers could block requests

### JWT Issues

**Problem**: Token format or validation errors

**Symptoms**:
- "Invalid JWT" errors
- Token decode failures
- Authentication state inconsistencies

**Diagnosis**:

1. **Validate JWT format**:
   ```javascript
   // Check if token has 3 parts separated by dots
   const parts = token.split('.');
   console.log('JWT parts:', parts.length); // Should be 3
   ```

2. **Decode and inspect token**:
   ```javascript
   // Use jwt.io or decode manually
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Token payload:', payload);
   ```

3. **Check token expiration**:
   ```javascript
   const payload = JSON.parse(atob(token.split('.')[1]));
   const now = Math.floor(Date.now() / 1000);
   console.log('Token expired:', payload.exp < now);
   ```

## Environment-Specific Issues

### Development Environment

**Common issues in development**:

1. **Environment variables not loading**:
   ```bash
   # Ensure .env.local exists and is properly formatted
   ls -la .env.local
   cat .env.local
   ```

2. **Hot reload issues**:
   - Restart development server after changing environment variables
   - Clear browser cache and cookies
   - Check for cached service workers

3. **Port conflicts**:
   - Ensure development server is running on expected port
   - Check for conflicting local services

### Production Environment

**Common issues in production**:

1. **Environment variables not set**:
   - Verify variables are configured in hosting platform
   - Check deployment logs for environment variable errors
   - Ensure variables are available at build time

2. **Domain/CORS issues**:
   - Add production domain to Supabase allowed origins
   - Verify SSL certificate is valid
   - Check for mixed content issues (http/https)

3. **Build-time vs runtime variables**:
   - `NEXT_PUBLIC_*` variables are embedded at build time
   - Ensure variables are available during build process
   - Check build logs for missing variables

## Debugging Tools

### Browser Developer Tools

1. **Network Tab**:
   - Check authentication requests
   - Look for 400/401/403 status codes
   - Inspect request headers and payloads

2. **Console Tab**:
   - Look for JavaScript errors
   - Check for validation warnings
   - Monitor authentication state changes

3. **Application Tab**:
   - Inspect localStorage/sessionStorage
   - Check cookies and their domains
   - Monitor service worker activity

### Application Debug Tools

The application includes built-in debugging tools:

1. **Auth Debug Component**:
   ```
   /debug - Access authentication debug information
   ```

2. **Environment Validation**:
   ```bash
   npm run validate-env
   ```

3. **Auth Logging**:
   - Check application logs for authentication events
   - Monitor structured error logs
   - Review session management logs

## Step-by-Step Resolution

### For 400 Bad Request Errors

1. **Verify Supabase URL format**:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   # Should be: https://[project-ref].supabase.co
   ```

2. **Check anon key validity**:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY | cut -d'.' -f2 | base64 -d
   # Should decode to valid JSON
   ```

3. **Test configuration**:
   ```bash
   npm run validate-env
   ```

4. **Restart application**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build && npm start
   ```

### For Session Issues

1. **Clear browser data**:
   - Clear cookies for your domain
   - Clear localStorage/sessionStorage
   - Disable browser extensions temporarily

2. **Check middleware configuration**:
   - Verify protected routes are correctly configured
   - Check redirect logic
   - Ensure session validation is working

3. **Test authentication flow**:
   - Try logging in with different browsers
   - Test in incognito/private mode
   - Check mobile vs desktop behavior

## Getting Help

If you're still experiencing issues:

1. **Collect diagnostic information**:
   - Browser console errors
   - Network request details
   - Environment configuration (without sensitive data)
   - Steps to reproduce the issue

2. **Check application logs**:
   - Server-side authentication logs
   - Client-side error logs
   - Middleware execution logs

3. **Verify Supabase project status**:
   - Check Supabase dashboard for project health
   - Verify API limits and usage
   - Check for any service disruptions

## Prevention

### Best Practices

1. **Use environment validation**:
   - Always validate configuration at startup
   - Implement proper error handling
   - Log configuration issues clearly

2. **Monitor authentication health**:
   - Set up error tracking
   - Monitor authentication success rates
   - Alert on configuration issues

3. **Document your setup**:
   - Keep environment variable documentation updated
   - Document any custom authentication logic
   - Maintain troubleshooting runbooks

### Regular Maintenance

1. **Review environment configuration monthly**
2. **Test authentication flow in all environments**
3. **Update dependencies and check for breaking changes**
4. **Monitor Supabase project health and limits**