/**
 * SunnyGPT - Confirmation Dialog Component
 * 
 * Author: Shamiur Rashid Sunny
 * Website: https://shamiur.com
 * 
 * A reusable confirmation dialog component for destructive actions.
 * Features:
 * - Modal overlay with backdrop blur
 * - Keyboard shortcuts (Enter to confirm, Escape to cancel)
 * - Customizable title, message, and button text
 * - Different variants (danger, warning, info) with color coding
 * - Smooth animations
 * - Client-side only rendering to prevent hydration errors
 */

'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

// Props interface for the ConfirmDialog component
interface ConfirmDialogProps {
    isOpen: boolean                      // Controls dialog visibility
    title: string                        // Dialog title
    message: string                      // Dialog message/description
    confirmText?: string                 // Text for confirm button (default: "Confirm")
    cancelText?: string                  // Text for cancel button (default: "Cancel")
    onConfirm: () => void               // Callback when confirm is clicked
    onCancel: () => void                // Callback when cancel is clicked
    variant?: 'danger' | 'warning' | 'info'  // Visual variant (default: 'danger')
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'danger',
}: ConfirmDialogProps) {
    // State to track if component has mounted on client
    // This prevents hydration errors by ensuring dialog only renders on client
    const [mounted, setMounted] = useState(false)

    // Set mounted to true after component mounts on client
    // This ensures the dialog is not rendered during server-side rendering
    useEffect(() => {
        setMounted(true)
    }, [])

    // Set up keyboard event listeners for Enter and Escape keys
    useEffect(() => {
        // Handler for Escape key - cancels the dialog
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel()
        }

        // Handler for Enter key - confirms the action
        const handleEnter = (e: KeyboardEvent) => {
            if (e.key === 'Enter') onConfirm()
        }

        // Only add listeners if dialog is open and component is mounted
        if (isOpen && mounted) {
            document.addEventListener('keydown', handleEscape)
            document.addEventListener('keydown', handleEnter)
        }

        // Cleanup: remove event listeners when dialog closes or component unmounts
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.removeEventListener('keydown', handleEnter)
        }
    }, [isOpen, mounted, onCancel, onConfirm])

    // Don't render anything on server or if not mounted (prevents hydration errors)
    // Also don't render if dialog is not open
    if (!mounted || !isOpen) return null

    // Define button styles for different variants
    const variantStyles = {
        danger: 'bg-red-500 hover:bg-red-600',      // Red for destructive actions
        warning: 'bg-yellow-500 hover:bg-yellow-600', // Yellow for warnings
        info: 'bg-blue-500 hover:bg-blue-600',      // Blue for informational
    }

    return (
        // Full-screen overlay container
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Semi-transparent backdrop with blur effect */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}  // Click outside to cancel
            />

            {/* Dialog box */}
            <div className="relative bg-background border rounded-lg shadow-lg max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
                {/* Dialog header with title and close button */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        onClick={onCancel}
                        className="p-1 rounded-md hover:bg-muted transition-colors"
                        aria-label="Close dialog"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Dialog content/message */}
                <div className="p-4">
                    <p className="text-muted-foreground">{message}</p>
                </div>

                {/* Dialog actions (Cancel and Confirm buttons) */}
                <div className="flex items-center justify-end gap-2 p-4 border-t">
                    {/* Cancel button */}
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md border hover:bg-muted transition-colors"
                    >
                        {cancelText}
                    </button>

                    {/* Confirm button with variant-specific styling */}
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-md text-white transition-colors ${variantStyles[variant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
