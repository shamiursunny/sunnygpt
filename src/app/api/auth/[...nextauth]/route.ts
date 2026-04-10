/**
 * =============================================================================
 * NextAuth API Route - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * This file handles all NextAuth.js authentication endpoints:
 * - GET /api/auth/providers - List available login methods
 * - POST /api/auth/callback/[provider] - OAuth callback
 * - POST /api/auth/signout - Sign out
 * - GET /api/auth/session - Get current session
 * 
 * =============================================================================
 */

import { handlers } from "@/auth"

// Export all NextAuth handlers
// This creates:
// - GET /api/auth (list providers)
// - POST /api/auth (sign in, sign out, etc.)
// - GET /api/auth/session (get session)
export const { GET, POST } = handlers