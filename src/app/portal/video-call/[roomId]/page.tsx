/**
 * =============================================================================
 * Video Call Page - SunnyGPT Enterprise
 * =============================================================================
 * Full-page video calling experience
 * Route: /portal/video-call/[roomId]
 * 
 * USAGE:
 * Navigate to /portal/video-call/room-123 to start a call
 * 
 * =============================================================================
 */

'use client'

import { use } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { VideoCall } from '@/components/video-call'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

/**
 * Video Call Page Component
 * Full-page video calling with room management
 */
export default function VideoCallPage() {
    const params = useParams()
    const router = useRouter()
    const roomId = params.roomId as string || 'default-room'

    /**
     * Handle call end - navigate back to chat
     */
    const handleCallEnded = () => {
        router.push('/portal/chat')
    }

    /**
     * Handle call start - generate room ID if not exists
     */
    const handleStartCall = () => {
        // In a real app, you'd create/join a room via API
        console.log('Starting call in room:', roomId)
    }

    return (
        <div className="h-screen w-full bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
                <Link 
                    href="/portal/chat" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Chat</span>
                </Link>
                
                <div className="text-white">
                    <span className="text-gray-400">Room: </span>
                    <span className="font-mono">{roomId}</span>
                </div>
                
                <div className="w-20" /> {/* Spacer for balance */}
            </div>

            {/* Video Call Container */}
            <div className="flex-1 p-4">
                <VideoCall 
                    roomId={roomId}
                    onCallEnded={handleCallEnded}
                    className="h-full max-w-6xl mx-auto"
                />
            </div>
        </div>
    )
}