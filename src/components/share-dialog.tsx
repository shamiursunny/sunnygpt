// Share Dialog for SunnyGPT
// Share files with different permission levels
// Built by Shamiur Rashid Sunny (shamiur.com)

'use client'

import { useState } from 'react'
import { 
    Globe, 
    Lock, 
    Eye, 
    Edit, 
    Copy, 
    Check,
    Share2,
    Link,
    QrCode,
    X,
    Clock,
    Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateShareableUrl } from '@/lib/file-manager'

interface ShareDialogProps {
    fileUrl: string
    filePath: string
    filename: string
    onClose?: () => void
    className?: string
}

type PermissionLevel = 'public' | 'private' | 'read_only' | 'write_only'

interface PermissionOption {
    value: PermissionLevel
    label: string
    description: string
    icon: React.ReactNode
}

const PERMISSION_OPTIONS: PermissionOption[] = [
    {
        value: 'public',
        label: 'Public',
        description: 'Anyone with the link can view',
        icon: <Globe className="h-5 w-5" />,
    },
    {
        value: 'read_only',
        label: 'View Only',
        description: 'Others can view but not download',
        icon: <Eye className="h-5 w-5" />,
    },
    {
        value: 'private',
        label: 'Private',
        description: 'Only you can access',
        icon: <Lock className="h-5 w-5" />,
    },
]

export function ShareDialog({ 
    fileUrl, 
    filePath,
    filename,
    onClose,
    className 
}: ShareDialogProps) {
    const [permission, setPermission] = useState<PermissionLevel>('public')
    const [expiration, setExpiration] = useState(86400) // 24 hours in seconds
    const [copied, setCopied] = useState(false)
    const [showQR, setShowQR] = useState(false)
    const [shareUrl, setShareUrl] = useState(fileUrl)

    // Generate shareable URL based on permission
    const generateUrl = async () => {
        if (permission === 'public') {
            // Public: use direct URL
            setShareUrl(fileUrl)
        } else if (permission === 'private') {
            // Private: don't share
            setShareUrl('')
        } else {
            // Read-only or write-only: generate signed URL
            const url = await generateShareableUrl(filePath, 'chat-files', expiration)
            setShareUrl(url)
        }
    }

    // Handle copy to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    // Handle share via system
    const handleSystemShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: filename,
                    text: `Check out this file: ${filename}`,
                    url: shareUrl,
                })
            } catch (err) {
                // User cancelled or error
            }
        }
    }

    // Handle permission change
    const handlePermissionChange = async (newPermission: PermissionLevel) => {
        setPermission(newPermission)
        setShareUrl('')
        
        // Generate URL for new permission
        if (newPermission === 'public') {
            setShareUrl(fileUrl)
        } else if (newPermission !== 'private') {
            const url = await generateShareableUrl(filePath, 'chat-files', expiration)
            setShareUrl(url)
        }
    }

    // Handle expiration change
    const handleExpirationChange = async (hours: number) => {
        setExpiration(hours * 3600)
        if (permission !== 'public' && permission !== 'private') {
            const url = await generateShareableUrl(filePath, 'chat-files', hours * 3600)
            setShareUrl(url)
        }
    }

    return (
        <div className={cn("bg-background rounded-lg border shadow-lg", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    <h3 className="font-semibold">Share File</h3>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-muted"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* File info */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Link className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded" />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{filename}</p>
                        <p className="text-sm text-muted-foreground">Click to share</p>
                    </div>
                </div>

                {/* Permission options */}
                <div className="space-y-2">
                    <p className="text-sm font-medium">Who can access</p>
                    {PERMISSION_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handlePermissionChange(option.value)}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                                permission === option.value
                                    ? "border-primary bg-primary/5"
                                    : "hover:bg-muted"
                            )}
                        >
                            <div className={cn(
                                "h-10 w-10 flex items-center justify-center rounded-full",
                                permission === option.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                            )}>
                                {option.icon}
                            </div>
                            <div>
                                <p className="font-medium">{option.label}</p>
                                <p className="text-sm text-muted-foreground">
                                    {option.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Expiration (for non-public) */}
                {permission !== 'public' && permission !== 'private' && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Link expires</p>
                        <div className="flex gap-2">
                            {[1, 24, 168].map((hours) => (
                                <button
                                    key={hours}
                                    onClick={() => handleExpirationChange(hours)}
                                    className={cn(
                                        "flex-1 px-3 py-2 rounded-lg text-sm transition-colors",
                                        (expiration / 3600) === hours
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                    )}
                                >
                                    {hours === 1 ? '1 hour' 
                                        : hours === 24 ? '24 hours' 
                                        : '7 days'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Share URL */}
                {permission !== 'private' && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Share link</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 px-3 py-2 rounded-lg bg-muted text-sm"
                            />
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    "px-3 py-2 rounded-lg transition-colors",
                                    copied
                                        ? "bg-green-500 text-white"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Private notice */}
                {permission === 'private' && (
                    <div className="p-3 bg-muted rounded-lg text-sm text-center">
                        <Lock className="h-4 w-4 inline mr-2" />
                        This file is private and cannot be shared externally
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-4 border-t">
                <button
                    onClick={handleSystemShare}
                    disabled={permission === 'private' || !shareUrl}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                    <Share2 className="h-4 w-4" />
                    Share
                </button>
                <button
                    onClick={() => setShowQR(!showQR)}
                    disabled={permission === 'private'}
                    className="px-4 py-2 bg-muted rounded-md hover:bg-muted/80 disabled:opacity-50"
                >
                    <QrCode className="h-4 w-4" />
                </button>
            </div>

            {/* QR Code */}
            {showQR && shareUrl && (
                <div className="p-4 border-t text-center">
                    <div className="inline-block p-4 bg-white rounded-lg">
                        {/* QR code placeholder - in real app, use a QR library */}
                        <div className="w-32 h-32 bg-muted flex items-center justify-center">
                            <QrCode className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Scan to access
                    </p>
                </div>
            )}
        </div>
    )
}