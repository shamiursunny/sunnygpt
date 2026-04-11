/**
 * =============================================================================
 * Session API - Get current session info
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * GET /api/auth/session - Returns current session info
 * 
 * =============================================================================
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false,
        user: null 
      })
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as any).role || 'user',
      }
    })
  } catch (error) {
    console.error("[Session API] Error:", error)
    return NextResponse.json({ 
      authenticated: false,
      error: "Failed to get session" 
    }, { status: 500 })
  }
}