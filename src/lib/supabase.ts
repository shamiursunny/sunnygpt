/**
 * Supabase Client Configuration
 * 
 * This module initializes the Supabase client for file storage operations.
 * Handles both runtime and build-time scenarios gracefully.
 * 
 * SECURITY: Uses public environment variables (NEXT_PUBLIC_*) which are safe
 * for client-side code. The anon key is designed to be public.
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

import { createClient } from '@supabase/supabase-js'

// Load Supabase credentials from environment variables
// These are NEXT_PUBLIC_* variables, safe for client-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client with proper error handling
// Returns a placeholder client during build time if credentials are not set
const createSupabaseClient = () => {
    // Validate that credentials are properly configured
    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
        return createClient(supabaseUrl, supabaseKey)
    }

    // Return a placeholder client for build time to prevent build failures
    // This allows the app to build even without Supabase credentials
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export const supabase = createSupabaseClient()
