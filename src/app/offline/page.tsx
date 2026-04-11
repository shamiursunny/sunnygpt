/**
 * =============================================================================
 * Offline Page - SunnyGPT Enterprise
 * =============================================================================
 * Displayed when user is offline and tries to access the app
 * 
 * =============================================================================
 */

'use client'

import Link from 'next/link'
import { WifiOff, Home, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
    /**
     * Retry connection
     */
    const handleRetry = () => {
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <WifiOff className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    You&apos;re Offline
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                    It looks like you&apos;ve lost your internet connection. 
                    Don&apos;t worry - your data is safe and we&apos;ll reconnect 
                    automatically once you&apos;re back online.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleRetry}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Go to Home
                    </Link>
                </div>

                {/* Offline Tips */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Quick Tips
                    </h3>
                    <ul className="text-sm text-gray-500 text-left space-y-2">
                        <li>✓ Check your Wi-Fi connection</li>
                        <li>✓ Try switching to mobile data</li>
                        <li>✓ Restart your router</li>
                        <li>✓ Wait a few moments and retry</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}