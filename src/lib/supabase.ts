// Supabase client for file storage
// Built by Shamiur Rashid Sunny (shamiur.com)
// NOTE: Using NEXT_PUBLIC_ vars here is safe - they're meant to be public
// Handles connection errors gracefully - returns null instead of crashing

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Track if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'))

// Client-side client (for public operations)
export const createSupabaseClient = (): SupabaseClient | null => {
    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase: Missing URL or key, skipping initialization')
        return null
    }

    if (!supabaseUrl.startsWith('http')) {
        console.warn('Supabase: Invalid URL format')
        return null
    }

    try {
        return createClient(supabaseUrl, supabaseKey)
    } catch (error) {
        console.error('Supabase: Failed to create client:', error)
        return null
    }
}

export const supabase = createSupabaseClient()

// Server-side client with service role key (for privileged operations like uploads)
export const createServerSupabaseClient = (): SupabaseClient | null => {
    if (!supabaseUrl) {
        console.warn('Supabase: Missing URL, cannot create server client')
        return null
    }

    // Try service key first
    if (supabaseServiceKey && supabaseUrl.startsWith('http')) {
        try {
            return createClient(supabaseUrl, supabaseServiceKey)
        } catch (error) {
            console.warn('Supabase: Failed with service key, trying anon key:', error)
        }
    }

    // Fallback to anon key if available
    if (supabaseKey && supabaseUrl.startsWith('http')) {
        try {
            return createClient(supabaseUrl, supabaseKey)
        } catch (error) {
            console.error('Supabase: Failed to create client with anon key:', error)
            return null
        }
    }

    console.warn('Supabase: Not configured, returning null client')
    return null
}
