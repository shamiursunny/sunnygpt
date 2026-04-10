/**
 * =============================================================================
 * NextAuth Middleware - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * This middleware:
 * - Protects /portal/* routes (requires authentication)
 * - Protects /admin/* routes (requires admin role)
 * - Allows /api/auth/* (auth routes are public)
 * - Allows /api/cron/* (cron jobs need special handling)
 * - Public routes: /, /login, /register
 * 
 * =============================================================================
 */

import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = (req.auth?.user as any)?.role
  const isAdmin = userRole === "admin"

  // ==========================================================================
  // PUBLIC ROUTES (no auth required)
  // ==========================================================================
  
  // Auth routes - always public
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }
  
  // OAuth callback routes
  if (pathname.startsWith("/api/auth/callback")) {
    return NextResponse.next()
  }
  
  // Login/Register pages - public
  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    // If logged in, redirect to portal
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/portal/chat", req.url))
    }
    return NextResponse.next()
  }
  
  // Health check - public
  if (pathname === "/api/health") {
    return NextResponse.next()
  }
  
  // Cron jobs - public (handled by cron auth in the route itself)
  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next()
  }

  // ==========================================================================
  // PROTECTED ROUTES
  // ==========================================================================
  
  // Portal routes (user dashboard) - require authentication
  if (pathname.startsWith("/portal")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }
  
  // Admin routes - require admin role
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    if (!isAdmin) {
      // Not admin - redirect to portal
      return NextResponse.redirect(new URL("/portal/chat", req.url))
    }
    return NextResponse.next()
  }
  
  // ==========================================================================
  // API PROTECTION
  // ==========================================================================
  
  // Protected API routes (exclude auth, health, cron)
  if (pathname.startsWith("/api/")) {
    // Public API endpoints
    const publicApis = ["/api/health", "/api/upload"]
    if (publicApis.some(p => pathname.startsWith(p))) {
      return NextResponse.next()
    }
    
    // All other API routes require authentication
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }
    
    // For admin-only APIs
    if (pathname.startsWith("/api/admin")) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 }
        )
      }
    }
    
    return NextResponse.next()
  }

  // ==========================================================================
  // DEFAULT
  // ==========================================================================
  
  return NextResponse.next()
})

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}