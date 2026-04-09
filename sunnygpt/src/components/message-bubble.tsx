// Individual message bubble - handles markdown, images, and deletion
// Built by Shamiur Rashid Sunny (shamiur.com)

'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { Bot, User, Trash2, RefreshCw, AlertCircle } from 'lucide-react'

// Props interface for the MessageBubble component
interface MessageBubbleProps {
    id: string                          // Unique message ID
    role: string                        // Message role: 'user' or 'model' (AI)
    content: string                     // Message text content
    fileUrl?: string | null             // Optional file attachment URL
    onDelete?: (messageId: string) => void  // Optional delete callback
    error?: boolean                     // Whether this message is an error
    errorMessage?: string               // Error message to display
    onRetry?: () => void                // Retry callback for failed messages
}

export function MessageBubble({ id, role, content, fileUrl, onDelete, error, errorMessage, onRetry }: MessageBubbleProps) {
    // Check if it's a user message or AI
    const isUser = role === 'user'

    // Track hover state to show/hide delete button
    const [isHovered, setIsHovered] = useState(false)

    // Track deletion state for fade-out animation
    const [isDeleting, setIsDeleting] = useState(false)

    // Handle deleting a message with a nice fade-out effect
    const handleDelete = async () => {
        // Don't delete if no callback provided
        if (!onDelete) return

        // Trigger fade-out animation
        setIsDeleting(true)

        // Call the delete callback with message ID
        onDelete(id)
    }

    return (
        // Message container with conditional styling and animations
        <div
            className={cn(
                'flex w-full items-start gap-4 p-4 transition-all duration-300',
                isUser ? 'flex-row-reverse' : 'flex-row',  // User messages on right, AI on left
                isDeleting && 'opacity-0 scale-95'          // Fade out when deleting
            )}
            // Track hover state for showing delete button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Avatar icon (User or Bot) */}
            <div
                className={cn(
                    'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
                    isUser ? 'bg-background' : 'bg-primary text-primary-foreground'
                )}
            >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Message content container */}
            <div className="flex-1 flex items-start gap-2">
                {/* Message bubble */}
                <div
                    className={cn(
                        'rounded-lg p-3 max-w-[80%] space-y-2',
                        isUser ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted',
                        error && 'border-2 border-red-500 bg-red-50 dark:bg-red-950/20'
                    )}
                >
                    {/* Error indicator */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                            <AlertCircle className="h-4 w-4" />
                            <span>Error</span>
                        </div>
                    )}

                    {/* File attachment (if present) */}
                    {fileUrl && (
                        <img
                            src={fileUrl}
                            alt="Uploaded content"
                            className="max-w-full rounded-md"
                        />
                    )}

                    {/* Message text with markdown rendering */}
                    <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>

                    {/* Error message and retry button */}
                    {error && errorMessage && (
                        <div className="space-y-2 pt-2 border-t border-red-300 dark:border-red-700">
                            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    <span>Retry</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Delete button (shown on hover for user messages OR AI messages) */}
                {onDelete && isHovered && !isDeleting && (
                    <button
                        onClick={handleDelete}
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-red-500 transition-all duration-200 animate-in fade-in zoom-in-95"
                        title="Delete message"
                        aria-label="Delete this message"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    )
}
