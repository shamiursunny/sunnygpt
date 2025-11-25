# Environment Variables Documentation

## Required Variables

### Database
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### AI APIs
```
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Storage (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Optional Variables

```
NODE_ENV=production
```

## Setup Instructions

1. Create a `.env.local` file in the project root
2. Copy the variables above and fill in your actual values
3. For production (Vercel), add these in the Vercel dashboard under Settings > Environment Variables
4. Never commit `.env.local` or any file containing real credentials to Git

## Getting API Keys

- **Gemini API**: https://makersuite.google.com/app/apikey
- **OpenRouter API**: https://openrouter.ai/keys
- **Supabase**: https://app.supabase.com/ (create a project)
- **Neon Database**: https://neon.tech/ (create a database)
