# AI Agent Development Guide - SunnyGPT

**Project**: SunnyGPT - AI Chat Application  
**Author**: Shamiur Rashid Sunny (https://shamiur.com)  
**License**: Proprietary - All Rights Reserved  
**Last Updated**: 2025-11-24

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Setup](#environment-setup)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [Key Components](#key-components)
8. [Development Workflow](#development-workflow)
9. [Deployment](#deployment)
10. [Common Issues & Solutions](#common-issues--solutions)
11. [Code Conventions](#code-conventions)

---

## 🎯 Project Overview

SunnyGPT is a full-stack AI chat application similar to ChatGPT, featuring:

- **AI Chat**: Powered by OpenRouter (free tier available) or Google Gemini
- **Chat History**: Persistent storage using PostgreSQL (Neon)
- **File Uploads**: Support for images and documents via Supabase Storage
- **Voice Features**: Speech-to-text input and text-to-speech output
- **Real-time UI**: Optimistic updates for smooth user experience

### Key Features
- Multiple chat conversations with persistent history
- File attachment support (images, PDFs, documents)
- Voice input using Web Speech API
- Voice output with text-to-speech
- Markdown rendering for AI responses
- Mobile-responsive design

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with Lucide React icons
- **Markdown**: react-markdown for AI response rendering

### Backend
- **Runtime**: Node.js 20.x
- **API Routes**: Next.js API routes (server-side)
- **Database ORM**: Prisma 5.22.0
- **Database**: PostgreSQL (Neon serverless)

### External Services
- **AI Provider**: OpenRouter API (using meta-llama/llama-3.2-3b-instruct:free)
- **Alternative AI**: Google Gemini API (optional)
- **File Storage**: Supabase Storage
- **Hosting**: Vercel

### Key Dependencies
```json
{
  "@prisma/client": "^5.22.0",
  "@supabase/supabase-js": "^2.83.0",
  "openai": "^6.9.1",
  "@google/generative-ai": "^0.24.1",
  "next": "^14.2.16",
  "react": "^18.3.1"
}
```

---

## 📁 Project Structure

```
sunnygpt/
├── prisma/
│   └── schema.prisma          # Database schema (Chat, Message models)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts   # POST: Send message, get AI response
│   │   │   ├── chats/
│   │   │   │   ├── route.ts   # GET: List chats, POST: Create chat, PATCH: Update title, DELETE: Delete chat
│   │   │   │   └── [chatId]/
│   │   │   │       └── route.ts # GET: Get chat messages
│   │   │   ├── messages/
│   │   │   │   └── [messageId]/
│   │   │   │       └── route.ts # DELETE: Delete message
│   │   │   └── upload/
│   │   │       └── route.ts   # POST: Upload file to Supabase
│   │   ├── layout.tsx         # Root layout with metadata
│   │   ├── page.tsx           # Main page component
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── chat-interface.tsx # Main chat UI component
│   │   ├── message-bubble.tsx # Individual message display
│   │   ├── sidebar.tsx        # Chat history sidebar
│   │   ├── confirm-dialog.tsx # Confirmation dialog
│   │   └── footer.tsx         # Footer with attribution
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton
│       ├── supabase.ts        # Supabase client setup
│       ├── openrouter.ts      # OpenRouter API client
│       ├── gemini.ts          # Google Gemini API client
│       ├── speech.ts          # Web Speech API utilities
│       └── utils.ts           # Utility functions (cn for classnames)
├── .env                       # Environment variables (NOT in Git)
├── .env.template              # Template for environment variables
├── ENV_SETUP_GUIDE.txt        # Detailed environment setup guide
├── .nvmrc                     # Node.js version (20.x)
├── package.json               # Dependencies and scripts
├── vercel.json                # Vercel deployment config
├── next.config.mjs            # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── LICENSE                    # Proprietary license
└── README.md                  # Project documentation

```

---

## 🔐 Environment Setup

### Required Environment Variables

Create a `.env` file in the project root with these variables:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"

# AI Provider (Required - choose one or both)
OPENROUTER_API_KEY="sk-or-v1-..."
GEMINI_API_KEY="AIzaSy..."  # Optional

# File Storage (Required)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Where to Get Credentials

1. **DATABASE_URL**: 
   - Sign up at https://neon.tech
   - Create a new project
   - Copy connection string from dashboard
   - Must include `?sslmode=require`

2. **OPENROUTER_API_KEY**:
   - Sign up at https://openrouter.ai
   - Go to Keys section
   - Create new API key
   - Free tier available!

3. **GEMINI_API_KEY** (Optional):
   - Go to https://makersuite.google.com/app/apikey
   - Create API key

4. **SUPABASE_URL & SUPABASE_ANON_KEY**:
   - Sign up at https://supabase.com
   - Create new project
   - Go to Project Settings → API
   - Copy URL and anon/public key
   - Create a bucket named `chat-files` in Storage
   - Set bucket to public access

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/shamiursunny/sunnygpt.git
cd sunnygpt

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.template .env
# Edit .env with your credentials

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate deploy

# 6. Start development server
npm run dev

# 7. Open browser
# Navigate to http://localhost:3000
```

---

## 🗄️ Database Schema

### Models

#### Chat
Represents a conversation thread.

```prisma
model Chat {
  id        String    @id @default(cuid())
  title     String
  createdAt DateTime  @default(now())
  messages  Message[]
}
```

#### Message
Represents individual messages in a chat.

```prisma
model Message {
  id        String   @id @default(cuid())
  content   String
  role      String   // 'user' or 'assistant'
  chatId    String
  chat      Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  fileUrl   String?  // Optional file attachment URL
  fileType  String?  // Optional file MIME type
}
```

### Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## 🔌 API Routes

### POST /api/chat
Send a message and get AI response.

**Request Body**:
```json
{
  "message": "Hello, how are you?",
  "chatId": "clx123...",  // Optional, creates new chat if not provided
  "fileUrl": "https://...",  // Optional
  "fileType": "image/png"    // Optional
}
```

**Response**:
```json
{
  "response": "I'm doing well, thank you!",
  "chatId": "clx123...",
  "messageId": "clx456..."
}
```

### GET /api/chats
List all chats (sorted by most recent).

**Response**:
```json
[
  {
    "id": "clx123...",
    "title": "Chat about AI",
    "createdAt": "2025-11-24T10:00:00Z"
  }
]
```

### POST /api/chats
Create a new chat.

**Request Body**:
```json
{
  "title": "New Chat"
}
```

### PATCH /api/chats
Update chat title.

**Request Body**:
```json
{
  "chatId": "clx123...",
  "title": "Updated Title"
}
```

### DELETE /api/chats
Delete a chat and all its messages.

**Request Body**:
```json
{
  "chatId": "clx123..."
}
```

### GET /api/chats/[chatId]
Get all messages for a specific chat.

**Response**:
```json
{
  "messages": [
    {
      "id": "clx456...",
      "content": "Hello",
      "role": "user",
      "createdAt": "2025-11-24T10:00:00Z",
      "fileUrl": null,
      "fileType": null
    }
  ]
}
```

### DELETE /api/messages/[messageId]
Delete a specific message.

### POST /api/upload
Upload a file to Supabase Storage.

**Request**: FormData with file

**Response**:
```json
{
  "url": "https://...supabase.co/storage/v1/object/public/chat-files/...",
  "type": "image/png"
}
```

---

## 🧩 Key Components

### ChatInterface (`src/components/chat-interface.tsx`)
Main chat component handling:
- Message input and submission
- File uploads
- Voice input (speech-to-text)
- Voice output (text-to-speech)
- Message display
- Optimistic UI updates

**Key State**:
- `messages`: Current chat messages
- `input`: User input text
- `isLoading`: AI response loading state
- `isListening`: Voice input active state
- `isSpeaking`: Voice output active state

### Sidebar (`src/components/sidebar.tsx`)
Chat history sidebar with:
- List of all chats
- Create new chat
- Edit chat titles
- Delete chats
- Mobile responsive drawer

### MessageBubble (`src/components/message-bubble.tsx`)
Individual message display with:
- User/AI role styling
- Markdown rendering
- File attachments
- Delete message option
- Copy message content

---

## 💻 Development Workflow

### Adding a New Feature

1. **Plan the feature**
   - Identify required database changes
   - Design API endpoints
   - Plan UI components

2. **Update database schema** (if needed)
   ```bash
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name add_feature_name
   ```

3. **Create/update API routes**
   - Add route in `src/app/api/`
   - Follow existing patterns
   - Add error handling

4. **Update components**
   - Modify existing or create new components
   - Use TypeScript for type safety
   - Follow existing styling patterns

5. **Test locally**
   ```bash
   npm run dev
   # Test in browser
   ```

6. **Build and verify**
   ```bash
   npm run build
   # Check for TypeScript errors
   ```

7. **Commit and push**
   ```bash
   git add .
   git commit -m "Add feature: description"
   git push origin main
   ```

### Code Style Guidelines

1. **TypeScript**: Always use TypeScript, avoid `any` type
2. **Comments**: Add JSDoc-style comments to all functions
3. **Error Handling**: Always wrap API calls in try-catch
4. **Async/Await**: Use async/await instead of promises
5. **Component Structure**: Functional components with hooks
6. **Naming**: Use descriptive names (camelCase for variables, PascalCase for components)

---

## 🚀 Deployment

### Vercel Deployment Settings

**Framework Preset**: Next.js  
**Root Directory**: `./`  
**Build Command**: `npm run build`  
**Output Directory**: `.next`  
**Install Command**: `npm install`  
**Node.js Version**: 20.x (auto-detected)

### Build Scripts

```json
{
  "dev": "next dev",
  "build": "prisma generate && next build",
  "start": "next start",
  "vercel-build": "prisma generate && prisma migrate deploy && next build"
}
```

**Important**: The `vercel-build` script:
1. Generates Prisma client
2. Applies database migrations
3. Builds Next.js app

### Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add all variables from `.env`
4. Select all environments (Production, Preview, Development)
5. Save and redeploy

### Deployment Checklist

- [ ] All environment variables added in Vercel
- [ ] Database migrations applied
- [ ] Supabase bucket `chat-files` created and set to public
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] All API routes tested

---

## 🐛 Common Issues & Solutions

### Issue: Prisma validation error during build

**Error**: `Error validating: This line is invalid`

**Solution**: Prisma schema only supports `//` comments, not `/** */` JSDoc comments.

```prisma
// ✅ Correct
// This is a comment

// ❌ Wrong
/**
 * This is a comment
 */
```

### Issue: DATABASE_URL not found during npm install

**Error**: `Environment variable not found: DATABASE_URL`

**Solution**: Remove `postinstall` script from package.json. Prisma generation should only happen in `build` and `vercel-build` scripts.

### Issue: Supabase storage upload fails

**Error**: `Storage error: Bucket not found`

**Solution**:
1. Create bucket named `chat-files` in Supabase Storage
2. Set bucket to public access
3. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

### Issue: AI response not working

**Error**: `OpenRouter API error`

**Solution**:
1. Verify `OPENROUTER_API_KEY` is valid
2. Check API key has credits (free tier available)
3. Verify model name in `src/lib/openrouter.ts` is correct

### Issue: Voice features not working

**Error**: Speech recognition not available

**Solution**:
1. Voice features only work in HTTPS or localhost
2. Use Chrome/Edge browser (best support)
3. Grant microphone permissions

### Issue: Build fails with "Module not found"

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

---

## 📝 Code Conventions

### File Headers

All source files should include copyright header:

```typescript
/**
 * [File Description]
 * 
 * [Detailed explanation of file purpose]
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */
```

For Prisma schema files, use `//` comments:

```prisma
// [File Description]
// 
// @author Shamiur Rashid Sunny
// @website https://shamiur.com
// @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
```

### API Route Pattern

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Missing required field' },
        { status: 400 }
      )
    }
    
    // Business logic
    const result = await someOperation(body)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Component Pattern

```typescript
'use client'

import { useState, useEffect } from 'react'

interface ComponentProps {
  prop1: string
  prop2?: number
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState<string>('')
  
  useEffect(() => {
    // Side effects
  }, [])
  
  const handleAction = async () => {
    try {
      // Action logic
    } catch (error) {
      console.error('Error:', error)
    }
  }
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

---

## 🔒 Security Notes

### Public vs Secret Variables

**✅ Safe to expose (client-side)**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These are designed for client-side use and have row-level security.

**❌ Never expose (server-side only)**:
- `DATABASE_URL`
- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY`

These should ONLY be used in API routes (server-side).

### Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use environment variables** - Never hardcode credentials
3. **Validate user input** - Always validate in API routes
4. **Use TypeScript** - Catch errors at compile time
5. **Error handling** - Always use try-catch in API routes
6. **HTTPS only** - Required for voice features and security

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Vercel Docs**: https://vercel.com/docs

---

## 🤝 Contributing Guidelines for AI Agents

When working on this project as an AI agent:

1. **Read this guide first** - Understand the architecture
2. **Check existing code** - Follow established patterns
3. **Test locally** - Always run `npm run build` before committing
4. **Update documentation** - Keep this guide current
5. **Preserve copyright** - Maintain all copyright headers
6. **Ask for clarification** - If requirements are unclear
7. **Commit frequently** - Small, focused commits
8. **Write descriptive messages** - Clear commit messages

### Before Making Changes

- [ ] Understand the current implementation
- [ ] Identify affected files
- [ ] Plan the changes
- [ ] Consider edge cases
- [ ] Think about error handling

### After Making Changes

- [ ] Test locally (`npm run dev`)
- [ ] Build successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] Update documentation if needed
- [ ] Commit with clear message
- [ ] Push to trigger Vercel deployment

---

**Last Updated**: 2025-11-24  
**Maintained By**: Shamiur Rashid Sunny  
**Contact**: https://shamiur.com

---

*This guide is designed to help AI agents quickly understand and work on the SunnyGPT project. Keep it updated as the project evolves.*
