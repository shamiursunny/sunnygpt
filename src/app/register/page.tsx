/**
 * =============================================================================
 * Register Page - SunnyGPT Enterprise
 * =============================================================================
 * Professional OAuth registration page
 * =============================================================================
 */

"use client"

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { AuthLayout } from '@/components/layout/auth-layout'

// OAuth providers
const OAUTH_PROVIDERS = [
  { id: 'google', name: 'Google', icon: '🔵', color: 'bg-white border-gray-300 hover:bg-gray-50' },
  { id: 'github', name: 'GitHub', icon: '⚫', color: 'bg-gray-900 text-white hover:bg-gray-800' },
  { id: 'facebook', name: 'Facebook', icon: '🔵', color: 'bg-blue-600 text-white hover:bg-blue-700' },
]

export default function RegisterPage() {
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    company: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleOAuthSignUp = async (provider: string) => {
    setIsLoading(provider)
    setError(null)
    
    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: '/portal/chat',
      })
      
      if (result?.error) {
        setError(`Failed to sign up with ${provider}. Please try again.`)
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    setIsLoading('email')
    setError(null)

    try {
      // In a full implementation, this would call an API to create the user
      // For now, we'll just redirect to login with a message
      setError('Email registration is coming soon. Please use OAuth to sign up.')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your 14-day free trial. No credit card required."
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
              onClick={() => handleOAuthSignUp(provider.id)}
              disabled={isLoading !== null}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${provider.color}`}
            >
              {isLoading === provider.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="text-xl">{provider.icon}</span>
              )}
              <span>Sign up with {provider.name}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-500">Or sign up with email</span>
          </div>
        </div>

        {/* Email Registration Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              autoComplete="given-name"
            />
            <Input
              label="Last name"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              autoComplete="family-name"
            />
          </div>
          
          <Input
            label="Work email"
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            autoComplete="email"
          />

          <Input
            label="Company name"
            placeholder="Acme Inc."
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            autoComplete="organization"
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            autoComplete="new-password"
            helperText="Must be at least 8 characters"
          />

          <Checkbox
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            label={
              <span className="text-sm">
                I agree to the{' '}
                <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
              </span>
            }
          />

          <Button
            type="submit"
            loading={isLoading === 'email'}
            className="w-full"
            size="lg"
          >
            Create account
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}