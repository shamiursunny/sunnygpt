/**
 * =============================================================================
 * Login Page Tests - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * Tests for the OAuth login functionality
 * 
 * =============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionProvider } from 'next-auth/react'

// Mock next-auth/react
const mockSignIn = vi.fn()
const mockUseSession = vi.fn(() => ({
  data: null,
  status: 'unauthenticated',
}))

vi.mock('next-auth/react', () => ({
  useSession: (...args: any[]) => mockUseSession(...args),
  signIn: (...args: any[]) => mockSignIn(...args),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams('callbackUrl=/portal/chat'),
  usePathname: vi.fn(() => '/login'),
}))

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignIn.mockResolvedValue({ url: 'https://example.com/callback' })
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })
  })

  it('renders the login page with SunnyGPT branding', async () => {
    const { default: LoginForm } = await import('@/app/login/login-form')
    
    render(<LoginForm />)
    
    expect(screen.getByText('SunnyGPT')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
  })

  it('renders all OAuth provider buttons', async () => {
    const { default: LoginForm } = await import('@/app/login/login-form')
    
    render(<LoginForm />)
    
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    expect(screen.getByText('Continue with GitHub')).toBeInTheDocument()
    expect(screen.getByText('Continue with Facebook')).toBeInTheDocument()
  })

  it('calls signIn when Google button is clicked', async () => {
    const user = userEvent.setup()
    const { default: LoginForm } = await import('@/app/login/login-form')
    
    render(<LoginForm />)
    
    const googleButton = screen.getByText('Continue with Google')
    await user.click(googleButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('google', {
        redirect: false,
        callbackUrl: '/portal/chat',
      })
    })
  })

  it('calls signIn when GitHub button is clicked', async () => {
    const user = userEvent.setup()
    const { default: LoginForm } = await import('@/app/login/login-form')
    
    render(<LoginForm />)
    
    const githubButton = screen.getByText('Continue with GitHub')
    await user.click(githubButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('github', {
        redirect: false,
        callbackUrl: '/portal/chat',
      })
    })
  })

  it('calls signIn when Facebook button is clicked', async () => {
    const user = userEvent.setup()
    const { default: LoginForm } = await import('@/app/login/login-form')
    
    render(<LoginForm />)
    
    const facebookButton = screen.getByText('Continue with Facebook')
    await user.click(facebookButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('facebook', {
        redirect: false,
        callbackUrl: '/portal/chat',
      })
    })
  })

  it('shows loading state when sign in is in progress', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    const { default: LoginForm } = await import('@/app/login/login-form')
    
    render(<LoginForm />)
    
    const googleButton = screen.getByText('Continue with Google')
    await user.click(googleButton)
    
    // Button should be disabled during loading - check the button element
    // The button wrapper might not have disabled on the span, check parent
    const button = googleButton.closest('button')
    expect(button).toBeDisabled()
  })

  it('displays error message when sign in fails', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: 'OAuthSigninFailure' })
    
    const { default: LoginForm } = await import('@/app/login/login-form')
    
    render(<LoginForm />)
    
    const googleButton = screen.getByText('Continue with Google')
    await user.click(googleButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to sign in with google/i)).toBeInTheDocument()
    })
  })

  it('redirects to callback URL on successful sign in', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ url: '/portal/chat' })
    
    const { default: LoginForm } = await import('@/app/login/login-form')
    
    render(<LoginForm />)
    
    const googleButton = screen.getByText('Continue with Google')
    await user.click(googleButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/portal/chat')
    })
  })
})