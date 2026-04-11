/**
 * =============================================================================
 * Forgot Password Page - SunnyGPT Enterprise
 * =============================================================================
 * Professional password recovery page
 * =============================================================================
 */

"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthLayout } from '@/components/layout/auth-layout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      // In a full implementation, this would call an API to send reset email
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success state
      setIsSubmitted(true)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent password reset instructions to your email"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm text-indigo-700">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or{' '}
            <button 
              onClick={() => setIsSubmitted(false)}
              className="text-indigo-600 hover:underline font-medium"
            >
              try another email address
            </button>
          </p>

          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you instructions to reset your password"
    >
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
            autoComplete="email"
          />

          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
            size="lg"
          >
            Send reset instructions
          </Button>
        </form>

        {/* Back to Login */}
        <div className="text-center">
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}