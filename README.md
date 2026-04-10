# SunnyGPT - Simplex GPT Platform

> **© 2025 Shamiur Rashid Sunny - All Rights Reserved**  
> **Website**: [shamiur.com](https://shamiur.com)  
> **License**: Proprietary - NOT Open Source  
> ⚠️ **Usage of this software requires explicit written permission from the author.**

A modern simplex GPT platform built with Next.js, AI (OpenRouter/Gemini), Neon DB, and Supabase.

---

## 📚 Documentation for AI Agents

**For AI agents working on this project**:
- 📖 **[AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md)** - Complete development guide
- ⚡ **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick start & common commands
- 🔐 **[ENV_SETUP_GUIDE.txt](ENV_SETUP_GUIDE.txt)** - Environment variables setup

These guides contain everything needed to understand and work on this project.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
See **[ENV_SETUP_GUIDE.txt](ENV_SETUP_GUIDE.txt)** for detailed instructions.

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"
OPENROUTER_API_KEY="your-openrouter-api-key"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

**Where to get credentials**:
- **DATABASE_URL**: [Neon](https://neon.tech) - Free PostgreSQL database
- **OPENROUTER_API_KEY**: [OpenRouter](https://openrouter.ai/keys) - Free tier available
- **SUPABASE**: [Supabase](https://supabase.com) - Free tier available

### 3. Set Up Database
```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. Configure Supabase Storage
1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket named `chat-files`
4. Set the bucket to **public**

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## ✨ Features

- 💬 **AI Chat**: Powered by OpenRouter (free tier) or Google Gemini
- 📝 **Chat History**: Persistent storage with PostgreSQL (Neon)
- 📎 **File Uploads**: Images and documents via Supabase Storage
- 🎤 **Voice Input**: Speech-to-text using Web Speech API
- 🔊 **Voice Output**: Text-to-speech for AI responses
- ✏️ **Edit Titles**: Inline chat title editing
- 🗑️ **Delete**: Remove chats and individual messages
- ⚡ **Optimistic UI**: Instant feedback with optimistic updates
- 🎨 **Modern UI**: Responsive design with Tailwind CSS
- 🌙 **Dark Mode**: Built-in dark theme

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **AI Provider**: OpenRouter API (free tier available)
- **Alternative AI**: Google Gemini API
- **File Storage**: Supabase Storage
- **Hosting**: Vercel
- **Node.js**: 20.x

---

## 🚀 Deployment to Vercel

### Quick Deploy

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Configure settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Root Directory**: `./`
4. Add environment variables (see ENV_SETUP_GUIDE.txt)
5. Deploy!

### Environment Variables in Vercel

Go to **Settings → Environment Variables** and add:
- `DATABASE_URL`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (optional)

Select all environments: **Production**, **Preview**, **Development**

### Post-Deployment

Database migrations are automatically applied via the `vercel-build` script:
```bash
prisma generate && prisma migrate deploy && next build
```

---

## 📖 Project Structure

```
sunnygpt/
├── src/
│   ├── app/
│   │   ├── api/              # API routes (server-side)
│   │   │   ├── chat/         # AI chat endpoint
│   │   │   ├── chats/        # Chat CRUD operations
│   │   │   ├── messages/     # Message operations
│   │   │   └── upload/       # File upload endpoint
│   │   ├── page.tsx          # Main page
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   ├── chat-interface.tsx
│   │   ├── sidebar.tsx
│   │   ├── message-bubble.tsx
│   │   └── footer.tsx
│   └── lib/                  # Utilities & clients
│       ├── prisma.ts         # Database client
│       ├── openrouter.ts     # AI client
│       ├── supabase.ts       # Storage client
│       └── speech.ts         # Voice features
├── prisma/
│   └── schema.prisma         # Database schema
├── AI_AGENT_GUIDE.md         # Full development guide
├── QUICK_REFERENCE.md        # Quick reference
└── ENV_SETUP_GUIDE.txt       # Environment setup
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message, get AI response |
| GET | `/api/chats` | List all chats |
| POST | `/api/chats` | Create new chat |
| PATCH | `/api/chats` | Update chat title |
| DELETE | `/api/chats` | Delete chat |
| GET | `/api/chats/[chatId]` | Get chat messages |
| DELETE | `/api/messages/[messageId]` | Delete message |
| POST | `/api/upload` | Upload file to Supabase |

See **[AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md)** for detailed API documentation.

---

## 🐛 Troubleshooting

### Common Issues

**Build fails with Prisma error**
- Ensure Prisma schema uses `//` comments, not `/** */`
- Run `npx prisma generate` before building

**Supabase upload fails**
- Create bucket named `chat-files` in Supabase Storage
- Set bucket to public access

**AI responses not working**
- Verify `OPENROUTER_API_KEY` is valid
- Check API key has credits (free tier available)

**Voice features not working**
- Use HTTPS or localhost
- Use Chrome/Edge browser
- Grant microphone permissions

See **[AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md)** for complete troubleshooting guide.

---

## 📝 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npx prisma studio    # Open database GUI
npx prisma generate  # Generate Prisma client
```

### Code Conventions

- **TypeScript**: All code uses TypeScript
- **Comments**: JSDoc-style comments on all functions
- **Error Handling**: Try-catch blocks in all API routes
- **Prisma Schema**: Use `//` comments only (not `/** */`)

See **[AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md)** for complete coding guidelines.

---

## 🤝 For Contributors & AI Agents

Before working on this project:

1. Read **[AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md)** for complete documentation
2. Check **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** for common commands
3. Review **[ENV_SETUP_GUIDE.txt](ENV_SETUP_GUIDE.txt)** for environment setup
4. Follow existing code patterns and conventions
5. Test locally with `npm run build` before committing

---

## 📄 License

**Proprietary Software - All Rights Reserved**

This software is the exclusive property of **Shamiur Rashid Sunny** ([shamiur.com](https://shamiur.com)).

- ❌ **NOT open source**
- ❌ **NOT free to use without permission**
- ✅ **Requires explicit written authorization** from the author for any use

See the [LICENSE](LICENSE) file for complete terms and conditions.

**Copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved**

