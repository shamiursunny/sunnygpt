/**
 * Message Bubble Component
 * 
 * Displays individual chat messages with the following features:
 * - Different styling for user vs AI messages
 * - Support for file attachments (images)
 * - Markdown rendering for formatted text
 * - Delete functionality for user messages
 * - Smooth fade-out animation on deletion
 * - Hover state for showing delete button
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { Bot, User, Trash2 } from 'lucide-react'

// Props interface for the MessageBubble component
interface MessageBubbleProps {
    id: string                          // Unique message ID
    role: string                        // Message role: 'user' or 'model' (AI)
    content: string                     // Message text content
    fileUrl?: string | null             // Optional file attachment URL
    onDelete?: (messageId: string) => void  // Optional delete callback
}

export function MessageBubble({ id, role, content, fileUrl, onDelete }: MessageBubbleProps) {
    // Determine if this is a user message (vs AI message)
    const isUser = role === 'user'

    // Track hover state to show/hide delete button
    const [isHovered, setIsHovered] = useState(false)

    // Track deletion state for fade-out animation
    const [isDeleting, setIsDeleting] = useState(false)

    /**
     * Handles message deletion
     * Sets deleting state for animation, then calls the delete callback
     */
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
                        isUser ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
                    )}
                >
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
                </div>

                {/* Delete button (only for user messages, shown on hover) */}
                {isUser && onDelete && isHovered && !isDeleting && (
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
