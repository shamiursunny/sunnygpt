/**
 * =============================================================================
 * Login Page - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * OAuth login page with Google, GitHub, Facebook options
 * 
 * =============================================================================
 */

"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Chrome, Github, Facebook, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/portal/chat"
  
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      setError("An unexpected error occurred. Please try again.")
      console.error("Sign in error:", err)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            SunnyGPT
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-4">
          {/* Google */}
          <button
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === "google" ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            ) : (
              <Chrome className="w-5 h-5 text-gray-700" />
            )}
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* GitHub */}
          <button
            onClick={() => handleOAuthSignIn("github")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === "github" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Github className="w-5 h-5" />
            )}
            <span className="font-medium">Continue with GitHub</span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleOAuthSignIn("facebook")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === "facebook" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Facebook className="w-5 h-5" />
            )}
            <span className="font-medium">Continue with Facebook</span>
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-gray-400 text-sm">or</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Email Sign In (Future) */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Email sign-in coming soon
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}