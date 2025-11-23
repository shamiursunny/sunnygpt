import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a dummy client for build time if credentials are not set
const createSupabaseClient = () => {
    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
        return createClient(supabaseUrl, supabaseKey)
    }

    // Return a placeholder client for build time
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export const supabase = createSupabaseClient()
