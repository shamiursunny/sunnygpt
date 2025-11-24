// Supabase client for file storage
// Built by Shamiur Rashid Sunny (shamiur.com)
// NOTE: Using NEXT_PUBLIC_ vars here is safe - they're meant to be public

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create the client with some fallback handling for build time
const createSupabaseClient = () => {
    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
        return createClient(supabaseUrl, supabaseKey)
    }

    // Placeholder for build time - prevents build errors
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export const supabase = createSupabaseClient()
