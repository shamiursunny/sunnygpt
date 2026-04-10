// Media Viewer for SunnyGPT
// View images, videos, and audio files from Supabase URLs
// Built by Shamiur Rashid Sunny (shamiur.com)

'use client'

import { useState, useEffect } from 'react'
import { 
    Play, 
    Pause, 
    Volume2, 
    VolumeX,
    Maximize,
    SkipBack,
    SkipForward,
    Image as ImageIcon,
    Video,
    Music,
    X,
    Download,
    Share2,
    ZoomIn,
    ZoomOut,
    RotateCw,
    FileQuestion
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isImage, isVideo, isAudio, formatFileSize, downloadFile } from '@/lib/file-manager'

interface MediaViewerProps {
    url: string
    type: string
    filename?: string
    onClose?: () => void
    className?: string
}

export function MediaViewer({ 
    url, 
    type, 
    filename = 'file',
    onClose,
    className 
}: MediaViewerProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    
    // Video/Audio state
    const [playing, setPlaying] = useState(false)
    const [muted, setMuted] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    
    const videoRef = typeof window !== 'undefined' ? document.createElement('video') : null
    const audioRef = typeof window !== 'undefined' ? document.createElement('audio') : null
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (videoRef) {
                videoRef.pause()
                videoRef.src = ''
            }
            if (audioRef) {
                audioRef.pause()
                audioRef.src = ''
            }
        }
    }, [])

    // Determine media type
    const mediaType = isImage(type) ? 'image' 
        : isVideo(type) ? 'video' 
        : isAudio(type) ? 'audio' 
        : 'unknown'

    // Handle download
    const handleDownload = () => {
        downloadFile(url, filename)
    }

    // Handle share
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: filename,
                    url: url,
                })
            } catch (err) {
                // User cancelled or error
            }
        } else {
            // Fallback: copy URL
            navigator.clipboard.writeText(url)
        }
    }

    // Format time for video/audio
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Render image viewer
    if (mediaType === 'image') {
        return (
            <div className={cn("relative flex items-center justify-center bg-black/90", className)}>
                {/* Controls */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                        onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                        className="p-2 bg-black/50 rounded-full hover:bg-black/70 text-white"
                        title="Zoom in"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                        className="p-2 bg-black/50 rounded-full hover:bg-black/70 text-white"
                        title="Zoom out"
                    >
                        <ZoomOut className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 bg-black/50 rounded-full hover:bg-black/70 text-white"
                        title="Download"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 bg-black/50 rounded-full hover:bg-black/70 text-white"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                
                {/* Image */}
                <img
                    src={url}
                    alt={filename}
                    className="max-h-full max-w-full object-contain transition-transform"
                    style={{ transform: `scale(${zoom})` }}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setLoading(false)
                        setError('Failed to load image')
                    }}
                />
                
                {/* Loading/Error */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}
            </div>
        )
    }

    // Render video player
    if (mediaType === 'video') {
        return (
            <div className={cn("relative bg-black rounded-lg overflow-hidden", className)}>
                <video
                    src={url}
                    className="w-full aspect-video"
                    controls={false}
                    onLoadedMetadata={(e) => {
                        setDuration(e.currentTarget.duration)
                        setLoading(false)
                    }}
                    onError={() => {
                        setLoading(false)
                        setError('Failed to load video')
                    }}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                />
                
                {/* Custom controls */}
                <div className="flex items-center gap-3 p-3 bg-black/80">
                    {/* Play/Pause */}
                    <button
                        onClick={() => {
                            const video = document.querySelector('video')
                            if (video) {
                                playing ? video.pause() : video.play()
                            }
                        }}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                    >
                        {playing ? (
                            <Pause className="h-5 w-5 text-white" />
                        ) : (
                            <Play className="h-5 w-5 text-white" />
                        )}
                    </button>
                    
                    {/* Progress bar */}
                    <div className="flex-1">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={(e) => {
                                const video = document.querySelector('video')
                                if (video) {
                                    video.currentTime = Number(e.target.value)
                                }
                            }}
                            className="w-full"
                        />
                    </div>
                    
                    {/* Time */}
                    <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    
                    {/* Volume */}
                    <button
                        onClick={() => {
                            const video = document.querySelector('video')
                            if (video) {
                                video.muted = !muted
                                setMuted(!muted)
                            }
                        }}
                        className="p-2"
                    >
                        {muted ? (
                            <VolumeX className="h-5 w-5 text-white" />
                        ) : (
                            <Volume2 className="h-5 w-5 text-white" />
                        )}
                    </button>
                    
                    {/* Download */}
                    <button onClick={handleDownload} className="p-2">
                        <Download className="h-5 w-5 text-white" />
                    </button>
                    
                    {/* Fullscreen */}
                    <button onClick={() => {
                        const video = document.querySelector('video')
                        if (video) {
                            video.requestFullscreen?.()
                        }
                    }} className="p-2">
                        <Maximize className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>
        )
    }

    // Render audio player
    if (mediaType === 'audio') {
        return (
            <div className={cn("bg-muted rounded-lg p-4", className)}>
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="h-16 w-16 flex items-center justify-center bg-primary/10 rounded-lg">
                        <Music className="h-8 w-8 text-primary" />
                    </div>
                    
                    {/* Info & controls */}
                    <div className="flex-1">
                        <p className="font-medium truncate">{filename}</p>
                        <p className="text-sm text-muted-foreground">
                            {formatFileSize(0)} {/* Would need file size */}
                        </p>
                        
                        {/* Audio element */}
                        <audio
                            src={url}
                            className="w-full mt-2"
                            controls
                            onLoadedMetadata={() => setLoading(false)}
                            onError={() => setError('Failed to load audio')}
                        />
                    </div>
                </div>
            </div>
        )
    }

    // Fallback: unknown file type
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 bg-muted rounded-lg", className)}>
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-center">
                Cannot preview this file type: {type}
            </p>
            <div className="flex gap-2 mt-4">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                    <Download className="h-4 w-4" />
                    Download
                </button>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md"
                >
                    <Share2 className="h-4 w-4" />
                    Share
                </button>
            </div>
        </div>
    )
}

/**
 * Simple image thumbnail component
 */
export function MediaThumbnail({ 
    url, 
    type, 
    onClick 
}: { 
    url: string
    type: string
    onClick?: () => void 
}) {
    const mediaType = isImage(type) ? 'image' 
        : isVideo(type) ? 'video' 
        : isAudio(type) ? 'audio' 
        : 'unknown'
    
    if (mediaType === 'image') {
        return (
            <img
                src={url}
                alt="attachment"
                className="h-full w-full object-cover cursor-pointer"
                onClick={onClick}
            />
        )
    }
    
    // Icon for non-image
    const getIcon = () => {
        switch (mediaType) {
            case 'video': return <Video className="h-8 w-8" />
            case 'audio': return <Music className="h-8 w-8" />
            default: return <FileQuestion className="h-8 w-8" />
        }
    }
    
    return (
        <div 
            className="h-full w-full flex items-center justify-center bg-muted cursor-pointer"
            onClick={onClick}
        >
            {getIcon()}
        </div>
    )
}