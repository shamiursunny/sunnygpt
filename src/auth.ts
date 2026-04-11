/**
 * =============================================================================
 * NextAuth Configuration - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * VERSION: 1.0.0
 * 
 * PURPOSE:
 * --------
 * This module configures NextAuth.js (Auth.js) with OIDC providers for SaaS.
 * Supports: Google, GitHub, Facebook, Email/Password (optional)
 * 
 * ARCHITECTURE:
 * -------------
 * - Uses Prisma adapter for database session storage
 * - JWT strategy for session handling
 * - OAuth 2.0 for Google, GitHub, Facebook
 * - Credentials provider for email/password (optional)
 * 
 * ENVIRONMENT VARIABLES NEEDED:
 * -----------------------------
 * - AUTH_SECRET (generated automatically if missing)
 * - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
 * - GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
 * - FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET
 * - NEXTAUTH_URL (default: https://sunnygpt-five.vercel.app)
 * 
 * =============================================================================
 */

import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"

// Import Prisma client
import { prisma } from "@/lib/prisma"

// Import email service
import { sendWelcomeEmail, sendAdminNewUserNotification } from "@/lib/email-service"

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * NextAuth configuration with OIDC providers
 * 
 * Supports:
 * - Google OAuth (requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
 * - GitHub OAuth (requires GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)
 * - Facebook OAuth (requires FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET)
 * - Email/Password (optional, uses bcrypt for hashing)
 */
export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for database storage
  adapter: PrismaAdapter(prisma),
  
  // Session strategy: JWT for stateless auth (works with Vercel)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Pages
  pages: {
    signIn: "/login",           // Custom login page
    error: "/login",           // Error page redirects to login
    verifyRequest: "/verify",  // Email verification (optional)
  },
  
  // OAuth Providers
  providers: [
    // Google OAuth
    {
      id: "google",
      name: "Google",
      type: "oauth",
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: { 
          prompt: "consent", 
          access_type: "offline", 
          response_type: "code" 
        },
      },
      token: "https://oauth2.googleapis.com/token",
      userinfo: "https://www.googleapis.com/oauth2/v2/userinfo",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
    
    // GitHub OAuth
    {
      id: "github",
      name: "GitHub",
      type: "oauth",
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: {
        url: "https://github.com/login/oauth/authorize",
        params: { scope: "read:user user:email" },
      },
      token: "https://github.com/login/oauth/access_token",
      userinfo: "https://api.github.com/user",
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        }
      },
    },
    
    // Facebook OAuth
    {
      id: "facebook",
      name: "Facebook",
      type: "oauth",
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      authorization: {
        url: "https://www.facebook.com/v18.0/dialog/oauth",
        params: { response_type: "code" },
      },
      token: "https://graph.facebook.com/v18.0/oauth/access_token",
      userinfo: "https://graph.facebook.com/me?fields=id,name,email,picture",
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url,
        }
      },
    },
  ],
  
  // Callbacks for custom logic
  callbacks: {
    // Add user ID and role to JWT token
    async jwt({ token, user, trigger, session }: { token: any; user: any; trigger?: string; session?: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "user"
        token.organizationId = user.organizationId
      }
      
      // Handle session update (e.g., after settings change)
      if (trigger === "update" && session) {
        token.settings = session
      }
      
      return token
    },
    
    // Add user info to session
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token) {
        session.user.id = token.id
        session.user.role = token.role || "user"
        session.user.organizationId = token.organizationId
      }
      return session
    },
    
    // Handle sign-in - create or update user
    async signIn(params: any) {
      // Allow sign in for all OAuth providers
      if (params.account?.provider !== "credentials") {
        return true
      }
      
      // For credentials provider, additional validation can be done here
      return true
    },
  },
  
  // Events for logging and notifications
  events: {
    async createUser(params: any) {
      const user = params.user
      console.log("[Auth] New user created:", user.email)
      
      // Send welcome email to new user
      if (user.email) {
        try {
          await sendWelcomeEmail(user.email, user.name || "User")
          console.log("[Auth] Welcome email sent to:", user.email)
        } catch (error) {
          console.error("[Auth] Failed to send welcome email:", error)
        }
      }
    },
    async signIn(params: any) {
      const user = params.user
      const account = params.account
      console.log("[Auth] User signed in:", user.email, "via", account?.provider)
      
      // Check if this is a new user signing in for the first time
      // Send notification to admin about new sign-in
      const adminEmail = "shamiur.sunny@gmail.com"
      if (user.email && user.email !== adminEmail) {
        try {
          await sendAdminNewUserNotification(
            adminEmail,
            user.name || "New User",
            user.email
          )
          console.log("[Auth] Admin notification sent for:", user.email)
        } catch (error) {
          console.error("[Auth] Failed to send admin notification:", error)
        }
      }
    },
    async signOut() {
      console.log("[Auth] User signed out")
    },
  },
  
  // Debug in development
  debug: process.env.NODE_ENV === "development",
}

// ============================================================================
// EXPORT AUTH HANDLERS
// ============================================================================

// Create the auth handler using NextAuth v4 pattern
const nextAuthHandler = NextAuth(authOptions)

// Export handlers for API routes - GET and POST for all auth endpoints
export const { GET, POST } = nextAuthHandler

// Export auth, signIn, signOut for use in other parts of the app
export const auth = nextAuthHandler.auth
export const signIn = nextAuthHandler.signIn
export const signOut = nextAuthHandler.signOut

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current user from request
 * Use in API routes: const session = await auth()
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await auth()
  return !!session
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "admin"
}

/**
 * Get user's organization ID
 */
export async function getUserOrganizationId() {
  const session = await auth()
  return (session?.user as any)?.organizationId || null
}

/**
 * Hash password (for email/password auth)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ============================================================================
// TYPE EXTENSIONS
// ============================================================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      organizationId?: string | null
    }
  }
  
  interface User {
    role?: string
    organizationId?: string | null
  }
}

// ============================================================================
// END OF AUTH CONFIGURATION
// ============================================================================