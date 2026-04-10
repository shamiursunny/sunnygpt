/**
 * =============================================================================
 * Portal Layout Tests - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * Tests for the portal layout navigation functionality
 * 
 * =============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

// Mock next-auth/react
const mockSignOut = vi.fn()
const mockUseSession = vi.fn(() => ({
  data: {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      image: null,
    },
  },
  status: 'authenticated',
}))

vi.mock('next-auth/react', () => ({
  useSession: (...args: any[]) => mockUseSession(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/portal/chat'),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  MessageSquare: () => <div data-testid="icon-message" />,
  Settings: () => <div data-testid="icon-settings" />,
  LogOut: () => <div data-testid="icon-logout" />,
  Users: () => <div data-testid="icon-users" />,
  LayoutDashboard: () => <div data-testid="icon-dashboard" />,
  ChevronLeft: () => <div data-testid="icon-chevron" />,
  Menu: () => <div data-testid="icon-menu" />,
}))

const mockChildren = <div data-testid="children">Test Content</div>

describe('Portal Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          image: null,
        },
      },
      status: 'authenticated',
    })
  })

  it('renders the SunnyGPT branding', async () => {
    const PortalLayout = (await import('@/app/portal/layout')).default
    
    render(
      <SessionProvider session={null}>
        <PortalLayout>{mockChildren}</PortalLayout>
      </SessionProvider>
    )
    
    expect(screen.getByText('SunnyGPT')).toBeInTheDocument()
  })

  it('displays navigation links', async () => {
    const PortalLayout = (await import('@/app/portal/layout')).default
    
    render(
      <SessionProvider session={null}>
        <PortalLayout>{mockChildren}</PortalLayout>
      </SessionProvider>
    )
    
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('displays user information', async () => {
    const PortalLayout = (await import('@/app/portal/layout')).default
    
    render(
      <SessionProvider session={null}>
        <PortalLayout>{mockChildren}</PortalLayout>
      </SessionProvider>
    )
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('has a sign out button', async () => {
    const PortalLayout = (await import('@/app/portal/layout')).default
    
    render(
      <SessionProvider session={null}>
        <PortalLayout>{mockChildren}</PortalLayout>
      </SessionProvider>
    )
    
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('renders children content', async () => {
    const PortalLayout = (await import('@/app/portal/layout')).default
    
    render(
      <SessionProvider session={null}>
        <PortalLayout>{mockChildren}</PortalLayout>
      </SessionProvider>
    )
    
    expect(screen.getByTestId('children')).toBeInTheDocument()
  })

  it('hides admin section for regular users', async () => {
    const PortalLayout = (await import('@/app/portal/layout')).default
    
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          image: null,
        },
      },
      status: 'authenticated',
    })
    
    render(
      <SessionProvider session={null}>
        <PortalLayout>{mockChildren}</PortalLayout>
      </SessionProvider>
    )
    
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('shows admin section for admin users', async () => {
    const PortalLayout = (await import('@/app/portal/layout')).default
    
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'admin-user-id',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          image: null,
        },
      },
      status: 'authenticated',
    })
    
    render(
      <SessionProvider session={null}>
        <PortalLayout>{mockChildren}</PortalLayout>
      </SessionProvider>
    )
    
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
  })
})