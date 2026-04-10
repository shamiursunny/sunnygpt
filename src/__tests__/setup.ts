/**
 * =============================================================================
 * Test Setup - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * This file sets up the testing environment for all tests
 * 
 * =============================================================================
 */

import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(),
}))

// Mock fetch globally
global.fetch = vi.fn()

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Global test utilities
global.createMockSession = (overrides = {}) => ({
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
})

global.createMockToken = (overrides = {}) => ({
  sub: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  ...overrides,
})

console.error = vi.fn((message) => {
  if (message.includes('Warning:')) return
  console.log('[Error]', message)
})