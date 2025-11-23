/**
 * SunnyGPT - Sidebar Component
 * 
 * Author: Shamiur Rashid Sunny
 * Website: https://shamiur.com
 * 
 * This component displays the chat history sidebar with the following features:
 * - List of all chat conversations
 * - Inline editing of chat titles
 * - Delete chat functionality with confirmation
 * - Optimistic UI updates for instant feedback
 * - Smooth animations and hover effects
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from './confirm-dialog'

// Interface defining the structure of a chat object
interface Chat {
    id: string          // Unique identifier for the chat
    title: string       // Display title of the chat
    createdAt: string   // Timestamp when chat was created
}

// Props interface for the Sidebar component
interface SidebarProps {
    currentChatId?: string                    // ID of the currently selected chat
    onChatSelect: (chatId: string) => void    // Callback when a chat is selected
    onNewChat: () => void                     // Callback when "New Chat" is clicked
    onChatDeleted?: () => void                // Callback when current chat is deleted
}

export function Sidebar({ currentChatId, onChatSelect, onNewChat, onChatDeleted }: SidebarProps) {
    // State for storing the list of chats
    const [chats, setChats] = useState<Chat[]>([])

    // State for tracking which chat is being edited (null if none)
    const [editingChatId, setEditingChatId] = useState<string | null>(null)

    // State for storing the edited title text
    const [editTitle, setEditTitle] = useState('')

    // State for managing the delete confirmation dialog
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; chatId: string | null }>({
        isOpen: false,
        chatId: null,
    })

    // State for tracking which chat is being hovered over
    const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)

    // Ref for the edit input field to manage focus
    const editInputRef = useRef<HTMLInputElement>(null)

    // Load chats when component mounts
    useEffect(() => {
        loadChats()
    }, [])

    // Auto-focus and select text when entering edit mode
    useEffect(() => {
        if (editingChatId && editInputRef.current) {
            editInputRef.current.focus()
            editInputRef.current.select()
        }
    }, [editingChatId])

    /**
     * Fetches the list of chats from the API
     * Called on component mount and after operations that modify the chat list
     */
    const loadChats = async () => {
        try {
            const response = await fetch('/api/chats')
            const data = await response.json()
            setChats(data)
        } catch (error) {
            console.error('Failed to load chats:', error)
        }
    }

    /**
     * Handles chat deletion
     * Uses optimistic update: removes chat from UI immediately, then makes API call
     * Rolls back if API call fails
     * 
     * @param chatId - The ID of the chat to delete
     */
    const handleDeleteChat = async (chatId: string) => {
        try {
            // Optimistic update: remove chat from UI immediately
            setChats(chats.filter((chat) => chat.id !== chatId))

            // Make API call to delete chat from database
            const response = await fetch(`/api/chats?chatId=${chatId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                // If deleted chat was the current chat, notify parent component
                if (currentChatId === chatId) {
                    onChatDeleted?.()
                }
            }
        } catch (error) {
            console.error('Failed to delete chat:', error)
            // Rollback: reload chats from server on error
            loadChats()
        } finally {
            // Close the confirmation dialog
            setDeleteConfirm({ isOpen: false, chatId: null })
        }
    }

    /**
     * Enters edit mode for a chat title
     * Sets the editing state and populates the input with current title
     * 
     * @param chat - The chat object to edit
     */
    const startEdit = (chat: Chat) => {
        setEditingChatId(chat.id)
        setEditTitle(chat.title)
    }

    /**
     * Cancels edit mode and clears edit state
     */
    const cancelEdit = () => {
        setEditingChatId(null)
        setEditTitle('')
    }

    /**
     * Saves the edited chat title
     * Uses optimistic update: updates UI immediately, then makes API call
     * Rolls back if API call fails or title is empty
     * 
     * @param chatId - The ID of the chat being edited
     */
    const saveEdit = async (chatId: string) => {
        // Don't save if title is empty
        if (!editTitle.trim()) {
            cancelEdit()
            return
        }

        try {
            // Make API call to update chat title
            const response = await fetch('/api/chats', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId, title: editTitle.trim() }),
            })

            if (response.ok) {
                // Optimistic update: update chat title in UI immediately
                setChats(
                    chats.map((chat) =>
                        chat.id === chatId ? { ...chat, title: editTitle.trim() } : chat
                    )
                )
            }
        } catch (error) {
            console.error('Failed to update chat title:', error)
            // Rollback: reload chats from server on error
            loadChats()
        } finally {
            // Exit edit mode
            cancelEdit()
        }
    }

    /**
     * Handles keyboard shortcuts in edit mode
     * Enter: Save changes
     * Escape: Cancel editing
     * 
     * @param e - Keyboard event
     * @param chatId - The ID of the chat being edited
     */
    const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
        if (e.key === 'Enter') {
            saveEdit(chatId)
        } else if (e.key === 'Escape') {
            cancelEdit()
        }
    }

    return (
        <>
            {/* Main sidebar container */}
            <div className="w-64 border-r bg-muted/40 flex flex-col h-full">
                {/* Header with "New Chat" button */}
                <div className="p-4 border-b">
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* Scrollable chat list */}
                <div className="flex-1 overflow-y-auto p-2">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            // Track hover state for showing edit/delete buttons
                            onMouseEnter={() => setHoveredChatId(chat.id)}
                            onMouseLeave={() => setHoveredChatId(null)}
                            className={cn(
                                'group relative flex items-center gap-2 px-3 py-2 rounded-md mb-1 transition-all duration-200',
                                // Highlight current chat
                                currentChatId === chat.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-muted'
                            )}
                        >
                            {/* Edit mode UI */}
                            {editingChatId === chat.id ? (
                                <>
                                    {/* Chat icon */}
                                    <MessageSquare className="h-4 w-4 shrink-0" />

                                    {/* Editable input field */}
                                    <input
                                        ref={editInputRef}
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, chat.id)}
                                        className="flex-1 bg-background border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />

                                    {/* Save button */}
                                    <button
                                        onClick={() => saveEdit(chat.id)}
                                        className="p-1 rounded hover:bg-primary/20 transition-colors"
                                        title="Save"
                                    >
                                        <Check className="h-3 w-3" />
                                    </button>

                                    {/* Cancel button */}
                                    <button
                                        onClick={cancelEdit}
                                        className="p-1 rounded hover:bg-muted transition-colors"
                                        title="Cancel"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Normal mode UI */}
                                    <button
                                        onClick={() => onChatSelect(chat.id)}
                                        className="flex items-center gap-2 flex-1 text-left min-w-0"
                                    >
                                        <MessageSquare className="h-4 w-4 shrink-0" />
                                        <span className="truncate text-sm">{chat.title}</span>
                                    </button>

                                    {/* Edit and delete buttons (shown on hover) */}
                                    {hoveredChatId === chat.id && (
                                        <div className="flex items-center gap-1 animate-in fade-in duration-150">
                                            {/* Edit button */}
                                            <button
                                                onClick={(e) => {
                                                    // Prevent triggering chat selection
                                                    e.stopPropagation()
                                                    startEdit(chat)
                                                }}
                                                className="p-1 rounded hover:bg-primary/20 transition-colors"
                                                title="Edit title"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </button>

                                            {/* Delete button */}
                                            <button
                                                onClick={(e) => {
                                                    // Prevent triggering chat selection
                                                    e.stopPropagation()
                                                    setDeleteConfirm({ isOpen: true, chatId: chat.id })
                                                }}
                                                className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                                                title="Delete chat"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Confirmation dialog for chat deletion */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Chat"
                message="Are you sure you want to delete this chat? This action cannot be undone and will delete all messages in this conversation."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                onConfirm={() => deleteConfirm.chatId && handleDeleteChat(deleteConfirm.chatId)}
                onCancel={() => setDeleteConfirm({ isOpen: false, chatId: null })}
            />
        </>
    )
}
