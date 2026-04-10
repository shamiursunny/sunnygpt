/**
 * =============================================================================
 * NextAuth Session Provider - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * Wrap the app with NextAuth session provider
 * 
 * =============================================================================
 */

"use client"

import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}