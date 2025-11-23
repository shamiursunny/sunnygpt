$env:DATABASE_URL="postgresql://neondb_owner:npg_06YuGhndPakJ@ep-little-band-a1kicnqg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
$env:GEMINI_API_KEY="AIzaSyCycD4-Bgz-i988dkmN8n7sVJmshyJTUgw"
$env:NEXT_PUBLIC_SUPABASE_URL="https://qdgfpuzzbqxzndufrukv.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZ2ZwdXp6YnF4em5kdWZydWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjM2ODYsImV4cCI6MjA3ODY5OTY4Nn0.8GbGwZHmHkTrXJHTU8_ksQGn1_Xsfm3nLe_JkdLhQ04"

Write-Host "Starting SunnyGPT on port 4000..." -ForegroundColor Green
npm run start
