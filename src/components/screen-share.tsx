/**
 * =============================================================================
 * Screen Share Component - SunnyGPT Enterprise
 * =============================================================================
 * Screen sharing functionality for video calls and presentations
 * 
 * FEATURES:
 * - Full screen sharing
 * - Application window sharing
 * - Browser tab sharing
 * - Screen preview
 * - Audio sharing option
 * 
 * =============================================================================
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { 
    Monitor, 
    AppWindow, 
    Globe, 
    Volume2, 
    VolumeX,
    X,
    Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ScreenShareOptions {
    video?: boolean
    audio?: boolean
}

interface ScreenSource {
    id: string
    name: string
    thumbnail: string
    type: 'screen' | 'window' | 'browser'
}

/**
 * Screen Share Picker Component
 * Lets user choose what to share
 */
interface ScreenSharePickerProps {
    onSelect: (stream: MediaStream) => void
    onClose: () => void
    className?: string
}

export function ScreenSharePicker({ onSelect, onClose, className }: ScreenSharePickerProps) {
    const [sources, setSources] = useState<ScreenSource[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [includeAudio, setIncludeAudio] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Get available screen sources (if supported)
     */
    const getSources = useCallback(async () => {
        // Check if desktopCapture API is available
        if (!('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices)) {
            setError('Screen sharing not supported in this browser')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Request screen share
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: 'monitor'
                },
                audio: includeAudio
            })

            // Get video track
            const videoTrack = stream.getVideoTracks()[0]

            // Handle when user stops sharing via browser UI
            videoTrack.onended = () => {
                onClose()
            }

            // Pass stream to parent
            onSelect(stream)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start screen sharing'
            
            if (errorMessage !== 'Permission denied' && errorMessage !== 'NotAllowedError') {
                setError(errorMessage)
            }
            // User cancelled - just close
            if (errorMessage === 'Permission denied' || errorMessage === 'NotAllowedError') {
                onClose()
            }
        } finally {
            setIsLoading(false)
        }
    }, [includeAudio, onSelect, onClose])

    /**
     * Quick share - no picker, direct to screen
     */
    const handleQuickShare = useCallback(async (type: 'screen' | 'window' | 'browser' = 'screen') => {
        setIsLoading(true)
        
        try {
            const displayMediaOptions: DisplayMediaStreamOptions = {
                video: {
                    displaySurface: type
                },
                audio: includeAudio
            }

            const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
            const videoTrack = stream.getVideoTracks()[0]

            videoTrack.onended = () => {
                onClose()
            }

            onSelect(stream)
        } catch (err) {
            console.error('Screen share error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [includeAudio, onSelect, onClose])

    return (
        <div className={cn('bg-white rounded-xl shadow-xl p-6 max-w-md w-full', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    Share Your Screen
                </h2>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Audio Option */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={includeAudio}
                        onChange={(e) => setIncludeAudio(e.target.checked)}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                        {includeAudio ? (
                            <Volume2 className="w-5 h-5 text-indigo-600" />
                        ) : (
                            <VolumeX className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-gray-700">
                            Include system audio
                        </span>
                    </div>
                </label>
                <p className="text-xs text-gray-500 mt-2 ml-8">
                    Share audio from your computer (Chrome only)
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Quick Share Options */}
            <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">Quick Share:</p>
                
                <button
                    onClick={() => handleQuickShare('screen')}
                    disabled={isLoading}
                    className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-gray-800">Entire Screen</p>
                        <p className="text-sm text-gray-500">Share your entire display</p>
                    </div>
                </button>

                <button
                    onClick={() => handleQuickShare('window')}
                    disabled={isLoading}
                    className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <AppWindow className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-gray-800">Application Window</p>
                        <p className="text-sm text-gray-500">Share a specific app window</p>
                    </div>
                </button>

                <button
                    onClick={() => handleQuickShare('browser')}
                    disabled={isLoading}
                    className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-gray-800">Browser Tab</p>
                        <p className="text-sm text-gray-500">Share a specific browser tab</p>
                    </div>
                </button>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="mt-4 text-center text-gray-500">
                    Opening screen picker...
                </div>
            )}
        </div>
    )
}

/**
 * Screen Preview Component
 * Shows preview of shared screen
 */
interface ScreenPreviewProps {
    stream: MediaStream
    onStop: () => void
    className?: string
}

export function ScreenPreview({ stream, onStop, className }: ScreenPreviewProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Attach stream to video element
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    /**
     * Toggle fullscreen
     */
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            videoRef.current?.parentElement?.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }, [])

    return (
        <div className={cn('relative bg-gray-900 rounded-lg overflow-hidden', className)}>
            {/* Video */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
            />

            {/* Overlay Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
                <button
                    onClick={onStop}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                    title="Stop sharing"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Label */}
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">
                Sharing Screen
            </div>
        </div>
    )
}

/**
 * Hook for screen sharing functionality
 */
export function useScreenShare() {
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [isSharing, setIsSharing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Start screen sharing
     */
    const startShare = useCallback(async (options: ScreenShareOptions = {}) => {
        try {
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: options.video !== false,
                audio: options.audio || false
            })

            // Handle track end
            mediaStream.getVideoTracks()[0].onended = () => {
                setStream(null)
                setIsSharing(false)
            }

            setStream(mediaStream)
            setIsSharing(true)
            setError(null)

            return mediaStream
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start screen sharing'
            setError(errorMessage)
            return null
        }
    }, [])

    /**
     * Stop screen sharing
     */
    const stopShare = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
            setIsSharing(false)
        }
    }, [stream])

    return {
        stream,
        isSharing,
        error,
        startShare,
        stopShare
    }
}

export default ScreenSharePicker