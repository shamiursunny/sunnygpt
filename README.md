# SunnyGPT - ChatGPT Clone

A modern ChatGPT clone built with Next.js, Gemini AI, Neon DB, and Supabase.

## Author

**Shamiur Rashid Sunny**  
Website: [shamiur.com](https://shamiur.com)

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
DATABASE_URL="your-neon-database-url"
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 3. Set Up Database
Run Prisma migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Configure Supabase Storage
1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket named `chat-files`
4. Set the bucket to public

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Features

- 💬 Real-time chat with Gemini AI
- 📝 Chat history persistence with Neon DB
- 📎 File upload support via Supabase Storage
- 🎨 Modern, responsive UI with Tailwind CSS
- 🌙 Dark mode support
- ⚡ Built with Next.js 14 App Router
- ✏️ Edit chat titles inline
- 🗑️ Delete chats and messages
- 🎤 Voice input (speech-to-text)
- 🔊 Voice output (text-to-speech)
- ⚡ Optimistic UI updates for instant feedback

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **AI**: Google Gemini API (via OpenRouter)
- **Database**: Neon (PostgreSQL) with Prisma ORM
- **Storage**: Supabase Storage
- **Deployment**: Vercel (recommended)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Make sure to run database migrations in production:
```bash
npx prisma migrate deploy
```

---

## License

Created by **Shamiur Rashid Sunny** - [shamiur.com](https://shamiur.com)

All rights reserved © 2025
