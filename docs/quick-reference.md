# Quick Reference - Environment Configuration

## ✅ Correct Configuration

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ❌ Common Mistakes

```bash
# Wrong - Vercel URL
NEXT_PUBLIC_SUPABASE_URL=https://sistema-rh-jo.vercel.app/dashboard

# Wrong - Dashboard URL  
NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/project/abc

# Wrong - Local URL
NEXT_PUBLIC_SUPABASE_URL=http://localhost:3000
```

## 🔧 Quick Commands

```bash
# Validate configuration
npm run validate-env

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Restart development server
npm run dev
```

## 🚨 Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `400 Bad Request` | Wrong Supabase URL | Use correct format: `https://[ref].supabase.co` |
| `Invalid API key` | Wrong anon key | Get fresh key from Supabase dashboard |
| `Project reference mismatch` | URL and key from different projects | Ensure both from same project |

## 📍 Get Supabase Credentials

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Settings > API
4. Copy **Project URL** and **anon public** key

## 📚 Documentation Links

- [Environment Setup Guide](./environment-setup.md)
- [Authentication Troubleshooting](./authentication-troubleshooting.md)
- [Environment Validation](./environment-validation.md)