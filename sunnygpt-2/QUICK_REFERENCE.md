# Quick Reference for AI Agents

**Project**: SunnyGPT  
**Author**: Shamiur Rashid Sunny  
**Last Updated**: 2025-11-24

---

## 🚀 Quick Start (30 seconds)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (copy from ENV_SETUP_GUIDE.txt)
cp .env.template .env
# Edit .env with your credentials

# 3. Generate Prisma client
npx prisma generate

# 4. Start development
npm run dev
```

---

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | Main AI chat endpoint |
| `src/components/chat-interface.tsx` | Main chat UI |
| `src/lib/openrouter.ts` | AI API client |
| `prisma/schema.prisma` | Database schema |
| `package.json` | Dependencies & scripts |
| `AI_AGENT_GUIDE.md` | Full documentation |

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create & apply migration
npx prisma studio        # Open database GUI

# Git
git add .
git commit -m "message"
git push origin main     # Triggers Vercel deployment
```

---

## 🗄️ Database Models

### Chat
- `id` (String): Unique ID
- `title` (String): Chat title
- `createdAt` (DateTime): Creation time
- `messages` (Message[]): Related messages

### Message
- `id` (String): Unique ID
- `content` (String): Message text
- `role` (String): 'user' or 'assistant'
- `chatId` (String): Foreign key to Chat
- `createdAt` (DateTime): Creation time
- `fileUrl` (String?): Optional file URL
- `fileType` (String?): Optional file MIME type

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat` | Send message, get AI response |
| GET | `/api/chats` | List all chats |
| POST | `/api/chats` | Create new chat |
| PATCH | `/api/chats` | Update chat title |
| DELETE | `/api/chats` | Delete chat |
| GET | `/api/chats/[chatId]` | Get chat messages |
| DELETE | `/api/messages/[messageId]` | Delete message |
| POST | `/api/upload` | Upload file |

---

## 🔐 Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."
OPENROUTER_API_KEY="sk-or-v1-..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# Optional
GEMINI_API_KEY="AIzaSy..."
```

**Get credentials from**:
- DATABASE_URL: https://neon.tech
- OPENROUTER_API_KEY: https://openrouter.ai/keys
- SUPABASE: https://supabase.com (create bucket: `chat-files`)

---

## 🚨 Critical Rules

### ✅ DO
- Use TypeScript for all code
- Add copyright headers to new files
- Test with `npm run build` before committing
- Use `//` comments in Prisma schema (not `/** */`)
- Handle errors with try-catch in API routes
- Use environment variables (never hardcode secrets)

### ❌ DON'T
- Commit `.env` files (already in .gitignore)
- Use `any` type in TypeScript
- Use JSDoc comments (`/** */`) in Prisma schema
- Expose secret environment variables client-side
- Skip error handling in API routes

---

## 🐛 Common Issues

### Build fails with Prisma error
```bash
# Solution: Use // comments in schema.prisma, not /** */
```

### DATABASE_URL not found during install
```bash
# Solution: Remove postinstall script from package.json
# Prisma generation should only be in build scripts
```

### Supabase upload fails
```bash
# Solution: Create bucket named "chat-files" in Supabase Storage
# Set bucket to public access
```

---

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **AI**: OpenRouter API (free tier)
- **Storage**: Supabase Storage
- **Hosting**: Vercel
- **Node**: 20.x

---

## 🎯 Project Structure

```
src/
├── app/
│   ├── api/          # API routes (server-side)
│   ├── page.tsx      # Main page
│   └── layout.tsx    # Root layout
├── components/       # React components
│   ├── chat-interface.tsx
│   ├── sidebar.tsx
│   └── message-bubble.tsx
└── lib/              # Utilities
    ├── prisma.ts     # Database client
    ├── openrouter.ts # AI client
    └── supabase.ts   # Storage client
```

---

## 🚀 Vercel Deployment

**Settings**:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Node Version: 20.x

**Don't forget**:
1. Add all environment variables in Vercel
2. Create Supabase bucket: `chat-files`
3. Verify DATABASE_URL includes `?sslmode=require`

---

## 📚 Full Documentation

See **AI_AGENT_GUIDE.md** for complete documentation including:
- Detailed architecture
- API route specifications
- Component documentation
- Development workflow
- Troubleshooting guide
- Code conventions

---

## 🤝 For AI Agents

**Before coding**:
1. Read AI_AGENT_GUIDE.md
2. Understand current implementation
3. Plan your changes

**After coding**:
1. Test locally: `npm run dev`
2. Build: `npm run build`
3. Commit with clear message
4. Push to deploy

---

**Need help?** Check AI_AGENT_GUIDE.md for detailed information.

**Author**: Shamiur Rashid Sunny (https://shamiur.com)  
**License**: Proprietary - All Rights Reserved
