/**
 * =============================================================================
 * Auth Helper - Get user context for API routes
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * Helper functions to get user context (userId, organizationId) for API routes
 * 
 * =============================================================================
 */

import { auth } from "@/auth"
import { NextResponse } from "next/server"

/**
 * Get user context from session
 * Returns { userId, organizationId, isAdmin } or unauthorized error
 */
export async function getUserContext() {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }
  
  return {
    userId: session.user.id,
    organizationId: (session.user as any).organizationId || null,
    role: (session.user as any).role || "user",
    isAdmin: (session.user as any).role === "admin",
  }
}

/**
 * Require authentication - returns error response if not authenticated
 */
export async function requireAuth() {
  const context = await getUserContext()
  
  if (!context) {
    return { 
      error: NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      ),
      context: null
    }
  }
  
  return { error: null, context }
}

/**
 * Require admin role - returns error response if not admin
 */
export async function requireAdmin() {
  const { error, context } = await requireAuth()
  
  if (error) return { error, context: null }
  
  if (!context?.isAdmin) {
    return {
      error: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      ),
      context: null
    }
  }
  
  return { error: null, context }
}

/**
 * Build where clause for multi-tenant queries
 * Returns Prisma where clause with organizationId and/or userId
 * Note: context should be the resolved value, not a Promise
 */
export function buildOwnershipFilter(context: { userId: string; organizationId: string | null; role: string; isAdmin: boolean } | null) {
  if (!context) return {}
  
  const filter: any = {}
  
  // If user has organization, filter by organization
  if (context.organizationId) {
    filter.organizationId = context.organizationId
  } else {
    // No organization - filter by userId for personal data
    filter.userId = context.userId
  }
  
  return filter
}

/**
 * Build where clause that includes public data + user data
 * For routes that might show public content alongside private
 * Note: context should be the resolved value, not a Promise
 */
export function buildSharedFilter(context: { userId: string; organizationId: string | null; role: string; isAdmin: boolean } | null) {
  if (!context) {
    // No auth - only return public data (organizationId: null)
    return { OR: [{ organizationId: null }, { userId: null }] }
  }
  
  // Has org - return org data OR personal data
  if (context.organizationId) {
    return {
      OR: [
        { organizationId: context.organizationId },
        { userId: context.userId }
      ]
    }
  }
  
  // Personal account - only return own data
  return { userId: context.userId }
}