/**
 * =============================================================================
 * Auth Layout - SunnyGPT Enterprise
 * =============================================================================
 * Professional auth layout with centered card and background
 * =============================================================================
 */

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AuthLayout({ 
  children, 
  title = 'Welcome to SunnyGPT',
  subtitle = 'Sign in to access your AI assistant and business tools'
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <span className="text-white text-2xl font-bold">SunnyGPT</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Enterprise AI Platform
            <br />for Modern Business
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Unlock the power of AI with our all-in-one business suite. 
            Chat AI, CRM, Accounting, Marketing, and more — all in one platform.
          </p>
          
          <div className="flex items-center gap-8 pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-sm text-white/70">Active Users</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-sm text-white/70">Uptime</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm text-white/70">Support</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            © 2026 SunnyGPT Enterprise. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">SunnyGPT</span>
            </Link>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </div>

          {/* Form */}
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout