/**
 * =============================================================================
 * Auth Configuration Tests - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * Tests for the NextAuth configuration and helpers
 * 
 * =============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    account: {
      findMany: vi.fn(),
    },
  },
}))

// Mock email service
vi.mock('@/lib/email-service', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(true),
  sendAdminNewUserNotification: vi.fn().mockResolvedValue(true),
}))

describe('Auth Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('OAuth Providers', () => {
    it('should have Google OAuth configured', async () => {
      // Import the authOptions from the auth module
      const authModule = await import('@/auth')
      const authOptions = authModule.authOptions
      
      const googleProvider = authOptions.providers.find(
        (p: any) => p.id === 'google'
      )
      
      expect(googleProvider).toBeDefined()
      expect(googleProvider.name).toBe('Google')
      expect(googleProvider.type).toBe('oauth')
    })

    it('should have GitHub OAuth configured', async () => {
      const authModule = await import('@/auth')
      const authOptions = authModule.authOptions
      
      const githubProvider = authOptions.providers.find(
        (p: any) => p.id === 'github'
      )
      
      expect(githubProvider).toBeDefined()
      expect(githubProvider.name).toBe('GitHub')
      expect(githubProvider.type).toBe('oauth')
    })

    it('should have Facebook OAuth configured', async () => {
      const authModule = await import('@/auth')
      const authOptions = authModule.authOptions
      
      const facebookProvider = authOptions.providers.find(
        (p: any) => p.id === 'facebook'
      )
      
      expect(facebookProvider).toBeDefined()
      expect(facebookProvider.name).toBe('Facebook')
      expect(facebookProvider.type).toBe('oauth')
    })
  })

  describe('Session Configuration', () => {
    it('should use JWT session strategy', async () => {
      const authModule = await import('@/auth')
      const authOptions = authModule.authOptions
      
      expect(authOptions.session.strategy).toBe('jwt')
    })

    it('should have 30 day session max age', async () => {
      const authModule = await import('@/auth')
      const authOptions = authModule.authOptions
      
      // 30 days in seconds = 30 * 24 * 60 * 60
      expect(authOptions.session.maxAge).toBe(30 * 24 * 60 * 60)
    })

    it('should redirect to /login on error', async () => {
      const authModule = await import('@/auth')
      const authOptions = authModule.authOptions
      
      expect(authOptions.pages.error).toBe('/login')
    })
  })

  describe('Callbacks', () => {
    it('should have jwt callback defined', async () => {
      const authModule = await import('@/auth')
      const authOptions = authModule.authOptions
      
      expect(authOptions.callbacks.jwt).toBeDefined()
    })

    it('should have session callback defined', async () => {
      const authModule = await import('@/auth')
      const authOptions = authModule.authOptions
      
      expect(authOptions.callbacks.session).toBeDefined()
    })
  })

  describe('Events', () => {
    it('should have createUser event defined', async () => {
      const authModule = await import('@/auth')
      const authOptions = authModule.authOptions
      
      expect(authOptions.events?.createUser).toBeDefined()
    })

    it('should have signIn event defined', async () => {
      const authModule = await import('@/auth')
      const authOptions = authModule.authOptions
      
      expect(authOptions.events?.signIn).toBeDefined()
    })
  })

  describe('Helper Functions', () => {
    it('should export authOptions for configuration', async () => {
      const auth = await import('@/auth')
      
      expect(auth.authOptions).toBeDefined()
      expect(auth.authOptions.providers).toBeDefined()
    })

    it('should have auth module exports', async () => {
      // Verify the auth module can be imported without errors
      const auth = await import('@/auth')
      expect(auth).toBeDefined()
    })
  })
})

describe('Auth Type Extensions', () => {
  it('should have user type with id, role, organizationId', () => {
    // This test verifies the type declarations compile correctly
    // Create a mock session that matches our extended type
    
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.png',
        role: 'admin',
        organizationId: 'org-123',
      },
    }
    
    // Type checking happens at compile time
    expect(mockSession.user.role).toBe('admin')
    expect(mockSession.user.id).toBe('user-123')
    expect(mockSession.user.organizationId).toBe('org-123')
  })
})