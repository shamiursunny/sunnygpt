/**
 * =============================================================================
 * Login Page - SunnyGPT Enterprise
 * =============================================================================
 * Professional OAuth login page with multiple providers
 * =============================================================================
 */

"use client"

import React, { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { AuthLayout } from '@/components/layout/auth-layout'

// OAuth providers with brand colors
const OAUTH_PROVIDERS = [
  { id: 'google', name: 'Google', icon: '🔵', color: 'bg-white border-gray-300 hover:bg-gray-50' },
  { id: 'github', name: 'GitHub', icon: '⚫', color: 'bg-gray-900 text-white hover:bg-gray-800' },
  { id: 'facebook', name: 'Facebook', icon: '🔵', color: 'bg-blue-600 text-white hover:bg-blue-700' },
]

export default function LoginPage() {
  const router = useRouter()
  const callbackUrl = (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('callbackUrl') : null) || '/portal/chat'
  
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(provider)
    setError(null)
    
    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl,
      })
      
      if (result?.error) {
        setError(`Failed to sign in with ${provider}. Please try again.`)
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Sign in error:', err)
    } finally {
      setIsLoading(null)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }
    
    setIsLoading('email')
    setError(null)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Suspense fallback={"Loading..."}>
      <AuthLayout
      title="Sign in to your account"
      subtitle="Access your AI assistant and business tools"
    >
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3">
          {OAUTH_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleOAuthSignIn(provider.id)}
              disabled={isLoading !== null}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${provider.color}`}
            >
              {isLoading === provider.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="text-xl">{provider.icon}</span>
              )}
              <span>Continue with {provider.name}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          
          <div className="flex items-center justify-between">
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              label="Remember me"
            />
            <Link
              href="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={isLoading === 'email'}
            className="w-full"
            size="lg"
          >
            Sign in
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
            Create one now
          </Link>
        </p>

        {/* Terms */}
        <p className="text-xs text-center text-gray-500">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-700">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>
        </p>
      </div>
      </AuthLayout>
    </Suspense>
  )
}
