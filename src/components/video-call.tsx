/**
 * =============================================================================
 * Video Call Component - SunnyGPT Enterprise
 * =============================================================================
 * WebRTC-based video calling with screen sharing capabilities
 * Supports: 1-on-1 video calls, screen sharing, audio toggle, video toggle
 * 
 * FEATURES:
 * - WebRTC peer connection for real-time video
 * - Screen sharing capability
 * - Audio/video mute controls
 * - Connection status indicator
 * - Responsive video layout
 * 
 * USAGE:
 * <VideoCall roomId="room-123" onCallEnded={() => {}} />
 * 
 * =============================================================================
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
    Video, 
    VideoOff, 
    Mic, 
    MicOff, 
    Monitor, 
    MonitorOff,
    PhoneOff,
    Maximize,
    Minimize,
    User,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Types for WebRTC
interface RTCConfig {
    iceServers: RTCIceServer[]
}

interface VideoCallProps {
    roomId: string
    onCallEnded?: () => void
    className?: string
}

// Default STUN servers for WebRTC
const defaultRTCConfig: RTCConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
    ]
}

/**
 * VideoCall Component
 * Provides WebRTC video calling functionality
 */
export function VideoCall({ roomId, onCallEnded, className }: VideoCallProps) {
    // State management
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle')
    const [error, setError] = useState<string | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Refs for media elements and peer connection
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
    const screenStreamRef = useRef<MediaStream | null>(null)

    /**
     * Initialize local media stream (camera + microphone)
     */
    const initializeMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            setLocalStream(stream)
            
            // Attach to local video element
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream
            }
            
            setIsConnecting(true)
            setConnectionStatus('connecting')
            
            // Create peer connection
            await createPeerConnection()
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to access camera/microphone'
            setError(errorMessage)
            console.error('Media initialization error:', err)
        }
    }, [])

    /**
     * Create RTCPeerConnection and set up handlers
     */
    const createPeerConnection = useCallback(async () => {
        const pc = new RTCPeerConnection(defaultRTCConfig)
        
        // Add local tracks to peer connection
        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream)
            })
        }

        // Handle incoming remote tracks
        pc.ontrack = (event) => {
            const [stream] = event.streams
            setRemoteStream(stream)
            
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream
            }
            
            setConnectionStatus('connected')
            setIsConnecting(false)
        }

        // Handle ICE connection state changes
        pc.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', pc.iceConnectionState)
            
            switch (pc.iceConnectionState) {
                case 'connected':
                case 'completed':
                    setConnectionStatus('connected')
                    setIsConnecting(false)
                    break
                case 'disconnected':
                case 'failed':
                    setConnectionStatus('disconnected')
                    break
                case 'closed':
                    setConnectionStatus('disconnected')
                    break
            }
        }

        // Handle ICE candidate generation
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                // In a real implementation, send this to signaling server
                console.log('New ICE candidate:', event.candidate)
            }
        }

        peerConnectionRef.current = pc
        return pc
    }, [localStream])

    /**
     * Toggle video on/off
     */
    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setIsVideoEnabled(videoTrack.enabled)
            }
        }
    }, [localStream])

    /**
     * Toggle audio on/off
     */
    const toggleAudio = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsAudioEnabled(audioTrack.enabled)
            }
        }
    }, [localStream])

    /**
     * Start screen sharing
     */
    const startScreenShare = useCallback(async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false
            })

            screenStreamRef.current = screenStream
            
            // Replace video track in peer connection
            if (peerConnectionRef.current && localStream) {
                const videoTrack = screenStream.getVideoTracks()[0]
                const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video')
                
                if (sender && videoTrack) {
                    await sender.replaceTrack(videoTrack)
                }

                // Handle screen share stop
                videoTrack.onended = () => {
                    stopScreenShare()
                }
            }

            setIsScreenSharing(true)
            
            // Show screen share in local video
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream
            }

        } catch (err) {
            console.error('Screen share error:', err)
        }
    }, [localStream])

    /**
     * Stop screen sharing
     */
    const stopScreenShare = useCallback(async () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop())
            screenStreamRef.current = null
        }

        // Restore camera video
        if (peerConnectionRef.current && localStream) {
            const videoTrack = localStream.getVideoTracks()[0]
            const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video')
            
            if (sender && videoTrack) {
                await sender.replaceTrack(videoTrack)
            }
        }

        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
        }

        setIsScreenSharing(false)
    }, [localStream])

    /**
     * End the call
     */
    const endCall = useCallback(() => {
        // Stop all tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
        }
        
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop())
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
            peerConnectionRef.current = null
        }

        // Reset state
        setLocalStream(null)
        setRemoteStream(null)
        setConnectionStatus('idle')
        setIsConnecting(false)
        
        // Call the callback
        onCallEnded?.()
    }, [localStream, onCallEnded])

    /**
     * Toggle fullscreen
     */
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => !prev)
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            endCall()
        }
    }, [])

    // Initialize media on mount
    useEffect(() => {
        initializeMedia()
    }, [initializeMedia])

    /**
     * Render connection status indicator
     */
    const renderConnectionStatus = () => {
        const statusColors = {
            idle: 'bg-gray-400',
            connecting: 'bg-yellow-400 animate-pulse',
            connected: 'bg-green-400',
            disconnected: 'bg-red-400'
        }
        
        const statusText = {
            idle: 'Ready',
            connecting: 'Connecting...',
            connected: 'Connected',
            disconnected: 'Disconnected'
        }

        return (
            <div className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', statusColors[connectionStatus])} />
                <span className="text-sm text-gray-600">{statusText[connectionStatus]}</span>
            </div>
        )
    }

    return (
        <div className={cn('flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden', className)}>
            {/* Video Container */}
            <div className="relative flex-1 bg-gray-800 min-h-[400px]">
                {/* Remote Video (Full size) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {remoteStream ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <User className="w-24 h-24 mb-4" />
                            <p className="text-lg">
                                {isConnecting ? 'Connecting to peer...' : 'Waiting for peer to join...'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Local Video (Picture-in-picture) */}
                <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden shadow-lg border-2 border-gray-600">
                    {localStream && isVideoEnabled ? (
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-600">
                            <VideoOff className="w-8 h-8 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Connection Status */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                    {renderConnectionStatus()}
                </div>

                {/* Room ID */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-300">Room: {roomId}</span>
                </div>

                {/* Loading overlay */}
                {isConnecting && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                            <p className="text-white">Establishing connection...</p>
                        </div>
                    </div>
                )}

                {/* Error overlay */}
                {error && (
                    <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-white text-center p-4">
                            <p className="text-lg font-semibold">Connection Error</p>
                            <p className="text-sm">{error}</p>
                            <Button onClick={initializeMedia} variant="primary">
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-center gap-4 p-4 bg-gray-800 border-t border-gray-700">
                {/* Mic Toggle */}
                <button
                    onClick={toggleAudio}
                    className={cn(
                        'p-4 rounded-full transition-all',
                        isAudioEnabled 
                            ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                            : 'bg-red-600 hover:bg-red-500 text-white'
                    )}
                    title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                >
                    {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                {/* Video Toggle */}
                <button
                    onClick={toggleVideo}
                    className={cn(
                        'p-4 rounded-full transition-all',
                        isVideoEnabled 
                            ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                            : 'bg-red-600 hover:bg-red-500 text-white'
                    )}
                    title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>

                {/* Screen Share Toggle */}
                <button
                    onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                    className={cn(
                        'p-4 rounded-full transition-all',
                        isScreenSharing 
                            ? 'bg-green-600 hover:bg-green-500 text-white' 
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                    )}
                    title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
                >
                    {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                </button>

                {/* Fullscreen Toggle */}
                <button
                    onClick={toggleFullscreen}
                    className="p-4 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-all"
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                    {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                </button>

                {/* End Call */}
                <button
                    onClick={endCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all"
                    title="End call"
                >
                    <PhoneOff className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}

/**
 * Video Call Button Component
 * Quick access to start a video call
 */
interface VideoCallButtonProps {
    onClick: () => void
    className?: string
}

export function VideoCallButton({ onClick, className }: VideoCallButtonProps) {
    return (
        <Button
            onClick={onClick}
            variant="primary"
            leftIcon={<Video className="w-4 h-4" />}
            className={className}
        >
            Start Video Call
        </Button>
    )
}

/**
 * Audio Call Component (placeholder for audio-only calls)
 */
interface AudioCallProps {
    roomId: string
    onCallEnded?: () => void
    className?: string
}

export function AudioCall({ roomId, onCallEnded, className }: AudioCallProps) {
    // Simplified audio-only call - can be expanded later
    return (
        <div className={cn('p-4 bg-gray-100 rounded-lg', className)}>
            <p className="text-gray-600">Audio call room: {roomId}</p>
            <Button 
                onClick={onCallEnded} 
                variant="danger" 
                size="sm"
                className="mt-2"
            >
                End Call
            </Button>
        </div>
    )
}

export default VideoCall